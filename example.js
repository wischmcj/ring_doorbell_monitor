import { PushNotificationAction, RingApi } from "ring-client-api";
import { readFile, writeFile } from "fs";
import { promisify } from "util";
import 'dotenv/config'

async function example() {
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

  if (allCameras.length) {
    allCameras.forEach((camera) => {
      camera.onNewNotification.subscribe((notification) => {
        const action = notification.android_config.category,
          event =
            action === PushNotificationAction.Motion
              ? "Motion detected"
              : action === PushNotificationAction.Ding
              ? "Doorbell pressed"
              : `Video started (${action})`;

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


// async function streamVideo(camera) {
//   console.log('Starting Video...')
//   const call = await camera.streamVideo({
//     // save video 10 second parts so the mp4s are playable and not corrupted:
//     // https://superuser.com/questions/999400/how-to-use-ffmpeg-to-extract-live-stream-into-a-sequence-of-mp4
//     output: [
//       '-flags',
//       '+global_header',
//       '-f',
//       'segment',
//       '-segment_time',
//       '10', // 10 seconds
//       '-segment_format_options',
//       'movflags=+faststart',
//       '-reset_timestamps',
//       '1',
//       path.join(outputDirectory, 'part%d.mp4'),
//     ],
//   })
//   console.log('Video started, streaming to part files...')

//   call.onCallEnded.subscribe(() => {
//     console.log('Call has ended')
//     process.exit()
//   })

//   setTimeout(function () {
//     console.log('Stopping call...')
//     call.stop()
//   }, 60 * 100) // Stop after 1 minute
// }

await example();