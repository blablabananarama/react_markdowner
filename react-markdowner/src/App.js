import React from "react";
import logo from "./logo.svg";
import "./App.css";
import MarkdownRenderer from "react-markdown-renderer";
import { ThemeProvider } from "emotion-theming";
import theme from "@rebass/preset";
import { Flex, Box, Text, Button } from "rebass";
import socketIOClient from "socket.io-client";
import Pdf from "react-to-pdf";

class App extends React.Component {
  //const [markdown, setMarkdown] = React.useState("");
  constructor(props) {
    super(props);
    this.state = {
      markdown: "",
      documentTitle: ""
    };
    this.handleMarkdownChange = this.handleMarkdownChange.bind(this);
    this.downloadMd = this.downloadMd.bind(this);
    this.expRef = React.createRef();
  }

  ws = new WebSocket("ws://192.168.1.13:8765/");

  componentWillMount() {
    this.ws.onopen = evt => {
      // on connecting, do nothing but log it to the console
      console.log("connected");
      //console.log(evt)
      //this.setState({markdown: evt.data.value})
    };

    this.ws.onmessage = evt => {
      // listen to data sent from the websocket server
      //const message = JSON.parse(evt.data)
      console.log(JSON.parse(evt.data));
      const message = JSON.parse(evt.data);
      this.setState({ markdown: message["text"], documentTitle: message["title"] });
    };

    this.ws.onclose = () => {
      console.log("disconnected");
      // automatically try to reconnect on connection loss
    };
  }

  handleMarkdownChange = event => {
    this.setState({ markdown: event.target.value }, () => {
      //console.log(JSON.stringify({"message": this.state.markdown}));
      this.ws.send(JSON.stringify({type: "text", message: this.state.markdown }));
    });
  };

  handleDocumentTitleChange = event => {
    this.setState({ documentTitle: event.target.value }, () => {
      //console.log(JSON.stringify({"message": this.state.markdown}));
      //this.ws.send(JSON.stringify({ message: this.state.markdown }));
      //console.log("banana")
      this.ws.send(JSON.stringify({type: "title", message: this.state.documentTitle }));
    });
  };

  downloadMd() {
    var text = this.state.markdown;
    var blob = new Blob([text], { type: ".md" });

    var a = document.createElement("a");
    a.download = this.state.documentTitle + ".md";
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [".md", a.download, a.href].join(":");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() {
      URL.revokeObjectURL(a.href);
    }, 1500);
  }

  render() {
    return (
      <div id="root" style={{ display: "flex", width: "100%", height: "100%" }}>
        <ThemeProvider theme={theme}>
          <Flex flexDirection={"column"}>
            <Flex flexShrink={1}>
              <Box px={2} py={1} width={1}>
                <Text fontSize={[3, 4, 5]} fontWeight="bold" color="primary">
                  Simple markdown preview app
                </Text>
                <input
                  value={this.state.documentTitle}
                  onChange={this.handleDocumentTitleChange}
                  placeholder="Document Name"
                  style={{
                    fontWeight: "bold",
                    fontSize: "48px",
                    border: "none",
                    backgroundColor: "transparent",
                    outline: "none"
                  }}
                />
              </Box>
            </Flex>
            <Flex flexGrow={1}>
              <Box p={3} width={1 / 2} color="white" bg="primary" flexGrow={1}>
                <textarea
                  autoFocus
                  value={this.state.markdown}
                  onChange={this.handleMarkdownChange}
                  style={{
                    fontFamily: "Helvetica",
                    color: "white",
                    border: "none",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
                    outline: "none",
                    resize: "none"
                  }}
                ></textarea>
              </Box>
              <Flex
                p={3}
                width={1 / 2}
                color="black"
                bg="muted"
                flexDirection={"column"}
                justifyContent={"space-between"}
                alignItems={"center"}
                flexGrow={1}
              >
                <Box px={2} py={1} width={1} flexGrow={1} ref={this.expRef}>
                  <MarkdownRenderer markdown={this.state.markdown} />
                </Box>
                <Flex
                  px={2}
                  py={1}
                  width={1}
                  flexShrink={1}
                  justifyContent={"space-around"}
                >
                  <Pdf targetRef={this.expRef} filename={this.state.documentTitle + ".pdf"}>
                    {({ toPdf }) => (
                      <Button
                        onClick={toPdf}
                        sx={{
                          transition: "0.4s",
                          ":hover": {
                            backgroundColor: "tomato",
                            transition: "0.2s"
                          }
                        }}
                      >
                        Download as PDF
                      </Button>
                    )}
                  </Pdf>
                  <Button
                    onClick={this.downloadMd}
                    sx={{
                      transition: "0.4s",
                      ":hover": {
                        backgroundColor: "tomato",
                        transition: "0.2s"
                      }
                    }}
                  >
                    Download as .md
                  </Button>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </ThemeProvider>
      </div>
    );
  }
}

export default App;
