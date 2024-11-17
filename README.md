# BuddyWatch User Interface

|          |               |
| :------: | :-----------: |
| Document | Documentation |
| Author:  |    nakkeez    |
| Version: |      1.0      |
|  Date:   |  28.10.2024   |

BuddyWatch is a deep learning enhanced surveillance system application for detecting humans from camera feed. The software has different user interface and server side applications working together to provide the functionality to the user.

The user interface is built with Next.js React framework using TypeScript. It uses the webcam of the user's device to capture images and videos, and provides functionality to send them to the server in order to be stored or processed by object detection model. Next.js was chosen for its excellent development experience with features such as automatic routing and hot code reloading, as well as its built-in Server-Side-Rendering support. Tailwind CSS was chosen for styling because of its excellent customization possibilities. Tailwind can also be more performant and have smaller bundle size compared to some UI libraries such as Material UI. The functionality of BuddyWatch already includes a lot of slow and heavy processes so the rendering should be kept very minimal.

The server is built using Django framework and Python 3.10. The server uses PostgreSQL database for storing information like user data and video information such as title, creation time, and owner. Videos themself are stored in Azure Blob Storage. When the server is started, it loads pre-trained Tensorflow object detection model to memory. Django was chosen for the server side because of the project's focus on object detection. Most deep learning libraries are built for Python, so using Django resulted in seamless integration of Tensorflow. Django's many built-in middleware's for security and error handling also make sure that the server will handle password hashing and invalid inputs with grace.

Here you can find the public GitHub repository for the [BuddyWatch Django Server](https://github.com/nakkeez/buddywatch-django-server "The backend repository for the BuddyWatch").

The object detection model has been developed using Keras Functional API with JupyterLab. VGG16 model was used as a base, and a new classification layer for detecting faces was built on top of it. The model was trained with a set of webcam images.

Here you can find the public GitHub repository for the [Tensorflow Object Detection Model](https://github.com/nakkeez/buddywatch-object-detection "The object detection model repository for the BuddyWatch").

## Features

- **Webcam View:** Displays the camera feed from the connected webcam.
- **Object Detection:** Sends images to a server for object detection and draws bounding boxes around detected objects.
- **Surveillance Mode:** Continuously sends images to the server for object detection.
- **Auto Recording:** Starts and stops recording based on the confidence score of the object detection model.
- **Manual Recording:** Allows the user to manually start and stop recording.
- **Download Recording:** Downloads the recorded video in webm format.
- **Upload Recording:** Uploads the recorded video to the server.
- **User Creation:** Allow the user to create accounts for using the app.
- **Sign In:** Allow the user to sign in to the app and get access to their specific videos.
- **Watch Videos:** Enable the user to watch videos they have previously recorded either with auto or manual recording.
- **Delete Videos:** Enable the user to delete videos stored to the server.

## Get-Started

### Environment variables:

Following environment variables are needed in .env.local file located in buddywatch/ directory for the application to function properly:

- **NEXT_PUBLIC_BASE_URL:** The base URL of the Django server.
- **NEXTAUTH_SECRET:** Secret for NextAuth authentication.
- **NEXTAUTH_URL:** Domain where the application is running on.

To install the dependencies, run:

```
npm install
```

To run the application in development mode, use:

```
npm run dev
```

To build the application for production, use:

```
npm run build
```

To start the application in production mode, use:

```
npm run start
```

## Dependencies

The application uses the following dependencies:

- **jwt-decode:** For decoding JWTs and getting needed information like expiration times.
- **next-auth:** For token based authentication and handling credentials.
- **react-webcam:** For accessing the webcam on user's device.
- **react-loader-spinner:** For displaying a loading spinner for slower operations like starting webcam and fetching videos from the server.
- **react-toastify:** For displaying notifications to user.
- **react-tooltip:** For displaying tooltips for WebcamView's buttons.
- **next-themes:** For switching between dark and light modes without flickering.
- **@iconify/react:** For providing icons.
- **tailwindcss:** For styling the user interface.
- **prettier:** For code formatting so that coding standards are maintained across the application.
- **prettier-plugin-tailwindcss:** For ordering of inline Tailwind classes.

- **buddywatch-django-server:** Application needs to communicate with the server in order to function properly.

## Routes

The BuddyWatch application includes following routes:

- **/** Home page of the application. Only accessible for logged in users. Displays a webcam feed and several action buttons for functionality like recording and surveillance.
- **/videos/** Displays list of videos the user has recorded. Only accessible for logged in users.
- **/login/** Displays the login form to sign in to the application. Publicly accessible.
- **/login/register** Displays the register form to create new users. Publicly accessible.

For all the other routes the app is using Next.js' built-in 404 Page to display error message to the user.

## Main Components

### WebcamView

The WebcamView component is a React component that provides an user interface for displaying the camera feed, making a single prediction, toggling surveillance mode, and recording video feed. It uses the react-webcam library for accessing the webcam, NextAuth for session management, react-toastify for displaying messages to the user, and Circles component from react-loader-spinner to display a loading spinner while the webcam is setting up. The component renders a webcam view with a set of action buttons for handling the different functionality.

#### Overview of its main features:

- **Webcam Feed Display:** The component uses the react-webcam package to access and display the user's webcam feed.
- **Loading State:** While the webcam is being loaded and getting ready for use, the webcam component is kept invisible and a loading spinner is displayed to the user. Once the webcam is loaded, the loading spinner will be removed and webcam component is make visible to the user.
- **Making Predictions:** The component can send images from the webcam feed to a server for object detection. The server responds with bounding box coordinates and a confidence score, which are then drawn on a HTML canvas overlaying the webcam feed. After two seconds, the canvas will be cleared of any drawn bounding boxes.
- **Taking Screenshot:** User can choose to take individual images that will be sent to the object detection model and prediction drawn to the canvas.
- **Surveillance Toggle:** The component allows the user to start and stop surveillance. When surveillance is on, images are sent to the server at regular 100ms intervals for object detection.
- **Recording Video Feed:** User can can start and stop recording the webcam feed. The recorded video can be downloaded to the user's device or stored to the server.
- **Auto Recording:** The component can automatically start and stop recording based on the confidence score of the object detection model. If a person is detected with a confidence score greater than 0.7, recording starts. If 10 consecutive images without a person are detected, recording stops, and the resulting video file is stored to the server.

### VideoPage

The VideoPage component is a React component that is responsible for displaying a list of videos to the user. It fetches the videos from Django server, and provides functionality for downloading and deleting videos. The component uses the useSession hook from NextAuth library to get the user's session data, the toast function from react-toastify to display messages to the user, and the Circles component from react-loader-spinner to display a loading spinner. It also uses the VideoItem component to display individual videos and their thumbnails, titles, and creation dates.

#### Overview of its main functionality:

- **Fetching Videos:** When the component is mounted, it checks if the user is authenticated. If the user is authenticated, it fetches the videos from the server and sets the videos state with the fetched videos.
- **Downloading Videos:** The component provides a function downloadVideo that takes a video id as a parameter. This function fetches the video from the server and downloads it to the user's device. If the download is successful, a success message is displayed to the user. If the download fails, an error message is displayed.
- **Deleting Videos:** The component provides a function deleteVideo that takes a video id as a parameter. This function sends a delete request to the server to delete the video. If the deletion is successful, a success message is displayed to the user and the list of videos is refreshed. If the deletion fails, an error message is displayed.
- **Rendering Videos:** The component maps over the videos state and renders a VideoItem component for each video. The VideoItem component displays the video's thumbnail, title, and creation date. It also provides buttons for downloading and deleting the video.
- **Loading State:** While the videos are being fetched from the server, a loading spinner is displayed to the user. Once the videos have been fetched, the loading spinner is replaced with the list of videos.

### Header

The Header component is a React component that provides functionality for navigating inside the app and switching between light and dark modes. It also allows logged in user to log out from the application. Header component is accessible from every route of the application.

#### Overview of its main functionality:

- **ThemeSwitch:** Uses ThemeSwitch component to let users switch between light and dark modes manually. ThemeSwitch uses next-themes library for presenting the app at the mode user has set their device's preferences. ThemeSwitch will apply the modes only after the component is mounted to prevent flickering. This is needed because preferences aren't available when rendering the page using Next.js' Server-Side-Rendering. The default mode is light mode, but if user's preference is set to use dark mode, the theme would need to change to dark mode when rendered on the client side. This could result in flash and worse user experience.
- **Navigation:** Navigates to webcam and video pages.
- **Logout:** Logs out the current user using NextAuth's Client API's signOut function and then redirects to the login page.

### LoginForm

The LoginForm component is a React component that provides an user interface for signin in to the application. It uses the NextAuth library's Client API for authentication. The component renders a form with two input fields for the username and password, and a login button. It also includes a link to the registration page. Values of inputted username and password are stored inside state variables.

#### Overview of its main functionality:

- **Login:** First checks if the username and password fields are not empty. If they are, it displays an error message using the react-toastify library and clears the password field. If the fields are not empty, it attempts to log in using the signIn function from NextAuth. If the login attempt is successful, it redirects the user to the home page. If the login attempt fails, it clears the password field and displays an error message.

### RegisterForm

The RegisterForm component is a React component that provides an user interface for registering a new user into the application. The component renders a form with three input fields for the username, password, and confirm password, and a register button. It also includes a link to the login page. Values of inputted username, password, and confirm password are stored inside state variables.

#### Overview of its main functionality:

- **Register User:** First checks if the username, password, and confirm password fields are not empty. If they are, it displays an error message using the react-toastify library. If the password and confirm password fields do not match, it also displays an error message. If the fields are valid, it attempts to register a new user by sending a POST request to the Django server. If the registration is successful, it redirects the user to the login page. If the registration fails, it displays an error message.

### NextAuth Authentication

The api/auth/[...nextauth]/route.ts file configures the authentication options for the Next.js application using the NextAuth library. It sets up a credentials provider for authentication and defines the necessary callbacks for JWT and session handling.

#### Overview of its main functionality:

- **authOptions:** An object that configures the authentication options for the Next.js application. It sets up a credentials provider for authentication with username and password fields. It also defines the authorize function that authenticates the user by sending a POST request to the server with the username and password. It specifies the /login route as custom sign-in page and defines the JWT and session callbacks. Jwt callback is called whenever a JWT token is created or updated. It first checks if the access token exists in the token object. If it does, it decodes the access and refresh tokens to get their expiration times. If the access token has expired but the refresh token has not, it refreshes the access token. If both tokens have expired, it returns null, effectively logging out the user. If the access token has not expired, it simply returns the token and user objects. Session callback is called whenever a session is accessed. It adds the token object to the session's user property, making the token data available in the session inside other components.

- **refreshAccessToken:** An asynchronous function that refreshes the access token from the server using the refresh token. It sends a POST request to the server with the refresh token and receives a new access token in response. If the refresh fails, it returns a null token object with an error.

### Middleware

The middleware.ts file sets up authentication middleware for the application using the NextAuth library. It makes sure that Home and Videos pages are unaccessible for unauthorized users.

- **withAuth:** This function from next-auth/middleware is used to create a middleware that checks if user is authenticated before they can access certain routes. It uses authorized callback to check if user's session is attached with valid access token.
