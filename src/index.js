import React from "react";
import ReactDOM from "react-dom";

import "@uppy/core/dist/style.css";
import "@uppy/status-bar/dist/style.css";
import "@uppy/drag-drop/dist/style.css";
import "@uppy/progress-bar/dist/style.css";
import "@uppy/dashboard/dist/style.css";

import "./styles.css";

const Uppy = require("@uppy/core");
// const Dashboard = require("@uppy/dashboard");
const GoogleDrive = require("@uppy/google-drive");
const Dropbox = require("@uppy/dropbox");
const Instagram = require("@uppy/instagram");
const Webcam = require("@uppy/webcam");
const Tus = require("@uppy/tus");
const {
  Dashboard,
  DashboardModal,
  DragDrop,
  ProgressBar
} = require("@uppy/react");

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showInlineDashboard: false,
      open: false
    };

    this.uppy = new Uppy({
      id: "uppy1",
      autoProceed: false,
      debug: false,
      allowMultipleUploads: false,
      restrictions: {
        // maxFileSize: 1000000,
        maxNumberOfFiles: 1,
        minNumberOfFiles: 1,
        allowedFileTypes: ["image/*", "video/*"]
      },
      onBeforeFileAdded: (currentFile, files) => {
        console.log(files);
        const modifiedFile = Object.assign({}, currentFile, {
          name: currentFile + Date.now()
        });
        if (!currentFile.type) {
          // log to console
          uppy.log(`Skipping file because it has no type`);
          // show error message to the user
          uppy.info(`Skipping file because it has no type`, "error", 500);
          return false;
        }
        return modifiedFile;
      }
    })
      .use(Tus, { endpoint: "https://master.tus.io/files/" })
      .use(GoogleDrive, { companionUrl: "https://companion.uppy.io" })
      .use(Dropbox, {
        companionUrl: "https://companion.uppy.io"
      })
      .use(Instagram, {
        companionUrl: "https://companion.uppy.io"
      })
      .use(Webcam, {
        onBeforeSnapshot: () => Promise.resolve(),
        countdown: false,
        modes: ["video-audio", "video-only", "audio-only", "picture"],
        mirror: true,
        facingMode: "user",
        locale: {
          strings: {
            // Shown before a picture is taken when the `countdown` option is set.
            smile: "Smile!",
            // Used as the label for the button that takes a picture.
            // This is not visibly rendered but is picked up by screen readers.
            takePicture: "Take a picture",
            // Used as the label for the button that starts a video recording.
            // This is not visibly rendered but is picked up by screen readers.
            startRecording: "Begin video recording",
            // Used as the label for the button that stops a video recording.
            // This is not visibly rendered but is picked up by screen readers.
            stopRecording: "Stop video recording",
            // Title on the “allow access” screen
            allowAccessTitle: "Please allow access to your camera",
            // Description on the “allow access” screen
            allowAccessDescription:
              "In order to take pictures or record video with your camera, please allow camera access for this site."
          }
        }
      });

    this.uppy2 = new Uppy({ id: "uppy2", autoProceed: false, debug: true }).use(
      Tus,
      { endpoint: "https://master.tus.io/files/" }
    );

    this.handleModalClick = this.handleModalClick.bind(this);
  }

  componentWillUnmount() {
    this.uppy.close();
    this.uppy2.close();
  }

  handleModalClick() {
    this.setState({
      open: !this.state.open
    });
    if (this.state.open === false) {
      this.uppy.cancelAll();
    }
  }

  render() {
    this.uppy.on("complete", result => {
      console.log(
        "Upload complete! We’ve uploaded these files:",
        result.successful
      );
    });

    return (
      <div>
        <h2>Modal Dashboard</h2>
        <div>
          <button onClick={this.handleModalClick}>
            {this.state.open ? "Close dashboard" : "Open dashboard"}
          </button>
          <DashboardModal
            uppy={this.uppy}
            plugins={["GoogleDrive", "Webcam", "Dropbox", "Instagram"]}
            metaFields={[
              { id: "name", name: "Name", placeholder: "File name" }
            ]}
            open={this.state.open}
            target={document.body}
            onRequestClose={() => this.setState({ open: false })}
          />
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
