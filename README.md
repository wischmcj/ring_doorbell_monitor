# Ring Doorbell Monitor

A Node.js application that monitors Ring doorbell cameras for motion detection and doorbell events, automatically recording video clips when events occur. The project also includes a web interface for viewing recorded videos and live streams.

## Features

- **Real-time Event Monitoring**: Listens for motion detection and doorbell press events from Ring cameras
- **Automatic Video Recording**: Records 10-second video clips when events are triggered
- **Web Interface**: Simple HTML interface for viewing recorded videos and live streams
- **Token Management**: Automatically handles Ring API refresh token updates
- **Multiple Recording Modes**: 
  - Event-driven recording (notifications)
  - Polling-based recording (checking for new events)
- **Video Storage**: Organized storage of recorded videos with unique identifiers

## Project Structure

```
ring_doorbell_monitor/
├── ring.js              # Main event monitoring script with notification-based recording
├── example.js           # Basic example of Ring API usage
├── doorbell_server.js   # WebSocket monitoring server (appears to be for different use case)
├── secrets.js           # Configuration file with API tokens and credentials
├── .env                 # Environment variables (Ring refresh token)
├── public/
│   ├── index.html       # Web interface for viewing videos/streams
│   └── output/          # Directory for recorded video files
├── output/              # Additional output directory for video segments
└── package.json         # Node.js dependencies and project metadata
```

## Dependencies

- **ring-client-api**: Official Ring API client for Node.js
- **dotenv**: Environment variable management
- **fs/promisify**: File system operations
- **path**: Path utilities

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```bash
RING_REFRESH_TOKEN=your_ring_refresh_token_here
```

**Getting a Ring Refresh Token:**
1. Follow the [ring-client-api documentation](https://github.com/dgreif/ring) for obtaining a refresh token
2. You'll need to authenticate with your Ring account credentials
3. The token will be automatically updated when it expires

### 3. Update Configuration (Optional)

Edit `secrets.js` if you need to customize:
- Email and password credentials
- Account ID
- Additional refresh tokens

**⚠️ Security Note**: The `secrets.js` file contains sensitive credentials and should never be committed to version control. Consider moving these to environment variables or a secure configuration management system.

## Usage

### Basic Event Monitoring

Run the main monitoring script:

```bash
node ring.js
```

This will:
- Connect to your Ring cameras
- Listen for motion detection and doorbell press events
- Automatically record 10-second video clips to `public/output/`
- Display event information in the console

### Example Usage

Run the basic example:

```bash
node example.js
```

This provides a simpler demonstration of:
- Connecting to Ring API
- Listing available cameras
- Monitoring for events (without recording)

### Web Interface

1. Start a local web server in the project directory
2. Navigate to `public/index.html`
3. The interface supports:
   - Viewing recorded video files
   - Live stream playback (if configured)
   - HLS.js integration for cross-platform video support

## How It Works

### Event-Driven Recording (`ring.js`)

1. **Authentication**: Uses refresh token to authenticate with Ring API
2. **Camera Discovery**: Automatically discovers all cameras on your Ring account
3. **Event Subscription**: Subscribes to push notifications for:
   - Motion detection events
   - Doorbell press events
   - Other camera events
4. **Automatic Recording**: When an event occurs:
   - Extracts event details (type, camera name, ding ID)
   - Records a 10-second video clip
   - Saves to `public/output/example_{ding_id}.mp4`
   - Logs event information with timestamp

### Polling-Based Recording (`noSubRecord` function)

Alternative recording method that:
- Polls Ring API every 3 seconds for new events
- Checks for motion events specifically
- Records videos for new/unseen events
- Prevents duplicate recordings

### Token Management

- Automatically handles refresh token updates
- Saves updated tokens back to `.env` file
- Ensures continuous operation without manual intervention

## Event Types

The system recognizes and handles:

- **Motion Detection**: Triggered by movement in camera view
- **Doorbell Press**: Triggered by physical doorbell button press
- **Other Events**: Various camera-specific events

Each event includes:
- Event type and category
- Camera name and location
- Unique ding/event ID
- Timestamp
- Associated video recording

## File Organization

### Video Files

- **Location**: `public/output/`
- **Naming**: `example_{ding_id}.mp4`
- **Duration**: 10 seconds per clip
- **Format**: MP4 with H.264 encoding

### Configuration Files

- **`.env`**: Contains Ring refresh token
- **`secrets.js`**: Additional credentials and tokens
- **`.gitignore`**: Excludes sensitive files and large video files

## Development Notes

### Code Structure

- **ES6 Modules**: Uses modern JavaScript import/export syntax
- **Async/Await**: Asynchronous operations with proper error handling
- **Event Subscription**: Reactive programming pattern for real-time monitoring
- **Promise-based**: File operations and API calls use promises

### Debugging

Enable debug mode by ensuring `debug: true` in the RingApi configuration. This provides detailed logging of:
- API requests and responses
- WebSocket connections
- Authentication flows
- Event notifications

## Troubleshooting

### Common Issues

1. **Authentication Errors**: 
   - Verify refresh token is valid and not expired
   - Check Ring account credentials
   - Ensure 2FA is properly configured

2. **No Events Detected**:
   - Verify cameras are online and properly configured
   - Check Ring app for proper notification settings
   - Ensure cameras have motion detection enabled

3. **Video Recording Failures**:
   - Check disk space in output directories
   - Verify write permissions
   - Ensure ffmpeg is available if custom encoding is needed

4. **Network Issues**:
   - Check internet connectivity
   - Verify firewall settings allow Ring API access
   - Consider network proxy configurations

### Logs and Monitoring

The application provides console logging for:
- Connection status and camera discovery
- Event notifications with details
- Recording start/completion
- Token refresh operations
- Error conditions

## Security Considerations

- **Credential Protection**: Keep `secrets.js` and `.env` files secure
- **Network Security**: Ring API uses HTTPS/WSS for secure communication  
- **Local Storage**: Video files are stored locally and not transmitted elsewhere
- **Token Rotation**: Refresh tokens are automatically rotated for security

## License

ISC License - See package.json for details.

## Contributing

This appears to be a personal project for Ring doorbell monitoring. When contributing:

1. Ensure sensitive credentials are never committed
2. Test thoroughly with your own Ring devices
3. Follow existing code style and patterns
4. Document any new features or configuration options

## Related Resources

- [Ring Client API Documentation](https://github.com/dgreif/ring)
- [Ring Developer Documentation](https://developers.ring.com/)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/) (for web video playback)