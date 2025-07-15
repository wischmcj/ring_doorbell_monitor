
import { RingApi } from 'ring-client-api'

import { email, password } from './secrets.js'

// note that RingApi returns a promise - the promise resolves when you are authenticated/
// authorised and have a session ready to start interacting with your ring deviecs. This
// promise will reject if for some reason you are not able to log in

async function example() {
    const ringApi = new RingApi({
        // Replace with your refresh token
        refreshToken: process.env.RING_REFRESH_TOKEN!,
        debug: true,
      }),
      cameras = await ringApi.getCameras(),
      camera = cameras[0]
  
    if (!camera) {
      console.log('No cameras found')
      return
    }
  
    // clean/create the output directory
    await cleanOutputDirectory()
  
    console.log(`Starting Video from ${camera.name} ...`)
    await camera.recordToFile(path.join(outputDirectory, 'example.mp4'), 10)
    console.log('Done recording video')
    process.exit(0)
  }
  
  example().catch((e) => {
    console.error(e)
    process.exit(1)
  })
}

// const logActivity = activity => console.log( 'there is a activity', activity );

// ringApi.events.on('activity', logActivity);

// console.log(ringApi.devices());