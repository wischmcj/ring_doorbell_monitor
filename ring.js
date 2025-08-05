
import * as path from 'path'

import { PushNotificationAction, RingApi } from "ring-client-api";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import 'dotenv/config'

async function start() {
  const ringApi = new RingApi({
    // This value comes from the .env file
    refreshToken: process.env.RING_REFRESH_TOKEN,
    debug: true,
  }),
  locations = await ringApi.getLocations(),
  allCameras = await ringApi.getCameras();

  console.log(
    `Found ${locations.length} location(s) with ${allCameras.length} camera(s).`
  );

  ringApi.onRefreshTokenUpdated.subscribe(
    async ({ newRefreshToken, oldRefreshToken }) => {
      console.log("Refresh Token Updated: ", newRefreshToken);

      // If you are implementing a project that use `ring-client-api`, you should subscribe to onRefreshTokenUpdated and update your config each time it fires an event
      // Here is an example using a .env file for configuration
      if (!oldRefreshToken) {
        return;
      }

      const currentConfig = await promisify(readFile)(".env"),
        updatedConfig = currentConfig
          .toString()
          .replace(oldRefreshToken, newRefreshToken);

      await promisify(writeFile)(".env", updatedConfig);
    }
  );

  var __dirname = new URL('.', import.meta.url).pathname
  var publicOutputDirectory = path.join(__dirname, 'public/output') 
  if (allCameras.length) {
    allCameras.forEach((camera) => {
      camera.onNewNotification.subscribe((notification) => {
        console.log('notification', notification)
        const action = notification.android_config.category,
          event =
            action === PushNotificationAction.Motion
              ? "Motion detected"
              : action === PushNotificationAction.Ding
              ? "Doorbell pressed"
              : `Video started (${action})`;
        camera.recordToFile(path.join(publicOutputDirectory, `example_${notification.data.event.ding.id}.mp4`), 10)
        console.log(
          `${event} on ${camera.name} camera. Ding id ${
            notification.data.event.ding.id
          }.  Received at ${new Date()}`
        );
      });
    });

    console.log("Listening for motion and doorbell presses on your cameras.");
  }
}
await start()

// console.log(process.env.RING_REFRESH_TOKEN)
// await start().catch((e) => {
//   console.error('Example threw an error:', e)
// })



async function noSubRecord(camera) {
  var events = [],
  __dirname = new URL('.', import.meta.url).pathname,
  publicOutputDirectory = path.join(__dirname, 'public/output') 
  var pkey = null
  for (let i = 0; i < 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const eventsResponse = await camera.getEvents({
      limit: 5,
      kind: 'motion',
      // state: 'accepted',
      // olderThanId: previousEventsResponse.meta.pagination_key
      // favorites: true
    })
    pkey = eventsResponse.meta.pagination_key
    // console.log('eventsResponse', eventsResponse)
    console.log('eventsResponse', event_id)
    console.log('pkey', pkey)
    for (let event of eventsResponse.events) {
      var event_id = event.event_id
      if (!events.includes(event_id)) {
        events.push(event_id)
        console.log(`Starting Video from ${camera.name} ...`)
        await camera.recordToFile(path.join(publicOutputDirectory, `example${i}.mp4`), 10)
        console.log('Done recording video')
      }
      else {
        console.log('event_id already in events', event_id)
      }
    }
  }
}


// start()

// example().catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })

