import React, { useEffect, useState } from "react";
import styled from "styled-components";
import "react-datepicker/dist/react-datepicker.css";
import { useHistory, useParams } from "react-router-dom";
import photo from "../../images/photo.jpg";
import { Form, Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import background from "../../images/manageBackground.jpg";
import { getReformatedLocalTime, getTomorrowDate } from "../../utils/time.js";
import { validateInput, validateEventTime } from "../../utils/validation.js";
import {
  getImageURL,
  getEventInfo,
  updateEvent,
} from "../../utils/firebase.js";
import { toast } from "react-toastify";
import { successAlertText, errorAlertText } from "../../components/Alert.js";

const Background = styled.div`
  width: 100%;
  height: 100%;
  background-image: url(${background});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
`;

const Mask = styled.div`
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
`;

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  margin-top: 0px;
`;

const CreateEventContainer = styled.div`
  max-width: 600px;
  width: 95%;
  display: flex;
  margin: 0 auto;
  margin-top: 100px;
  margin-bottom: 100px;
  flex-direction: column;
  padding: 10px 20px;
  background-color: white;
  border-radius: 8px;
  border: solid 1px #979797;
  min-height: calc(100vh - 200px);
`;

const Tags = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

const Option = styled.div`
  line-height: 20px;
  font-size: 1rem;
  padding: 5px 25px;
  border: 1px solid #ced4da;
  border-radius: 20px;
  margin-right: 10px;
  margin-bottom: 10px;
  text-align: center;
  color: #495057;
  cursor: pointer;
  @media (max-width: 760px) {
    font-size: 14px;
    padding: 5px 15px;
    margin-right: 5px;
  }
  :hover {
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.1);
  }
`;

const OptionSelected = styled(Option)`
  background-color: #67aeca;
  color: white;
`;

const Map = styled.iframe`
  width: 100%;
  height: 30vw;
  max-height: 300px;
  border-radius: 10px;
`;

const Button = styled.button`
  width: 120px;
  background-color: #0e6cd0;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  line-height: 1.5;
  padding: 5px 20px;
  margin-left: calc(50% - 60px);
  margin-top: 40px;
  margin-bottom: 20px;
`;

const DisabledButton = styled(Button)`
  opacity: 0.6;
  cursor: inherit;
`;

const ImagePreviewDiv = styled.div`
  width: 100%;
  height: 200px;
  background-color: #f8f8f8;
  border-radius: 5px;
  margin-bottom: 5px;
  position: relative;
  display: flex;
  justify-content: center;
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 200px;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
  border-radius: 5px;
`;

const StyledFormControl = styled(Form.Control)`
  width: 100%;
  height: 200px;
  margin: 0 auto;
  overflow: hidden;
  z-index: 4;
  ::-webkit-file-upload-button {
    visibility: hidden;
  }
  ::before {
    width: 100%;
    height: 200px;
    content: "選擇檔案";
    display: inline-block;
    padding: 5px 8px;
    outline: none;
    white-space: nowrap;
    cursor: pointer;
    font-size: 16px;
    border: 1px solid #ced4da;
    border-radius: 5px;
    background-color: transparent;
    color: transparent;
    text-align: center;
  }
`;

const Styles = styled.div`
  .form-label {
    @media (max-width: 760px) {
      font-size: 14px;
    }
  }
  .form-control {
    @media (max-width: 760px) {
      font-size: 14px;
    }
  }
  .form-control-file {
    @media (max-width: 760px) {
      font-size: 14px;
    }
  }
  .form-control .is-invalid {
    background-image: none;
  }
  .invalid-feedback {
    margin-top: 5px;
  }
  .css-yk16xz-control {
    @media (max-width: 760px) {
      font-size: 14px;
    }
  }
  input:focus {
    outline: none !important;
  }
`;

function CreateEvent() {
  const { id } = useParams();
  const eventId = id;

  const dispatch = useDispatch();
  const hosterId = useSelector((state) => state.isLogged.userId);

  const [timeIsInvalid, setTimeIsInvalid] = useState(false);
  const [titleIsInvalid, setTitleIsInvalid] = useState(false);
  const [contentIsInvalid, setContentIsInvalid] = useState(false);
  const [imageIsInvalid, setImageIsInvalid] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState("");

  const [uploadImage, setUploadImage] = useState(photo);

  const [eventInfo, setEventInfo] = useState("");
  const [getEventData, setGetEventData] = useState(false);

  const [eventExist, setEventExist] = useState("");

  const [loading, setLoading] = useState(true);

  const [submmited, setSubmmited] = useState(false);

  useEffect(() => {
    setSelectedAddress({ ...selectedAddress, label: "台灣" });
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !eventExist) {
      history.push("/");
    }
    // eslint-disable-next-line
  }, [eventExist]);

  const getReformatedTime = (time) => {
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    const localISOTime = new Date(time - tzoffset).toISOString().slice(0, -1);
    const localDate = localISOTime.split("T")[0];
    const localTime = localISOTime.split("T")[1].slice(0, 5);
    return { date: localDate, time: localTime };
  };

  const currentTime = getReformatedLocalTime(Date.now());
  const tomorrowDate = getTomorrowDate(Date.now());

  const [eventTime, setEventTime] = useState({
    startDate: tomorrowDate,
    startTime: currentTime.time,
    endDate: tomorrowDate,
    endTime: currentTime.time,
  });

  const [tags, setTags] = useState([
    { name: "社會福利", id: "社會福利", select: false },
    { name: "文化教育", id: "文化教育", select: false },
    { name: "環境保護", id: "環境保護", select: false },
    { name: "生態保護", id: "生態保護", select: false },
  ]);

  const getEventInformation = async () => {
    const eventInfo = await getEventInfo(eventId);
    setLoading(false);
    eventInfo ? setEventExist(true) : setEventExist(false);
    if (eventInfo) {
      eventInfo.startTime = getReformatedTime(eventInfo.startTime.toDate());
      eventInfo.endTime = getReformatedTime(eventInfo.endTime.toDate());
      setEventInfo(eventInfo);
      setSelectedAddress({
        ...selectedAddress,
        label: eventInfo.eventAddress.formatted_address,
      });
      setEventTime({
        ...eventTime,
        startDate: eventInfo.startTime.date,
        startTime: eventInfo.startTime.time,
        endDate: eventInfo.endTime.date,
        endTime: eventInfo.endTime.date,
      });
      setUploadImage(eventInfo.eventCoverImage);
      setTags(
        tags.map((tag) =>
          eventInfo.eventTags.includes(tag.id)
            ? { ...tag, select: true }
            : { ...tag }
        )
      );
      setGetEventData(true);
    }
  };

  useEffect(() => {
    getEventInformation();
    // eslint-disable-next-line
  }, []);

  const getGeopoint = async (address) => {
    let location;
    await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLEMAP}`
    )
      .then((res) => res.json())
      .then((result) => {
        location = result.results[0];
      });
    return location;
  };

  let history = useHistory();

  const handleTagClick = (tag) => {
    const selectedTagId = tag.target.id;
    setTags(
      tags.map((tag) =>
        tag.id === selectedTagId ? { ...tag, select: !tag.select } : tag
      )
    );
  };

  const getSelectedTags = (tags) => {
    let selectedTags = [];
    tags.forEach((tag) => {
      if (tag.select) {
        selectedTags.push(tag.name);
      }
    });
    return selectedTags;
  };

  useEffect(() => {
    const selectedTags = getSelectedTags(tags);
    dispatch({ type: "ADD_TAGS", data: selectedTags });
    // eslint-disable-next-line
  }, [tags]);

  const constructEventData = async (inputs) => {
    let imageUrl = eventInfo.eventCoverImage;
    if (inputs.coverImage.files[0]) {
      imageUrl = await getImageURL(hosterId, inputs.coverImage.files[0]);
    }

    let geopoint = eventInfo.eventAddress;
    if (selectedAddress.value) {
      geopoint = await getGeopoint(selectedAddress.label);
    }

    const eventData = {
      eventId: eventInfo.eventId,
      eventTitle: inputs.title.value,
      eventContent: inputs.content.value,
      eventAddress: geopoint,
      eventCoverImage: imageUrl,
      startTime: new Date(
        inputs.startTime[0].value + " " + inputs.startTime[1].value
      ),
      endTime: new Date(
        inputs.endTime[0].value + " " + inputs.endTime[1].value
      ),
      eventStatus: eventInfo.eventStatus,
      eventTags: getSelectedTags(tags),
      hosterId: eventInfo.hosterId,
      resultImage: eventInfo.resultImage,
      resultContent: eventInfo.resultContent,
    };
    return eventData;
  };

  const handleTimeChange = (input, value) => {
    const inputType = input;
    switch (inputType) {
      case "startDate":
        setEventTime({ ...eventTime, startDate: value });
        break;
      case "startTime":
        setEventTime({ ...eventTime, startTime: value });
        break;
      case "endDate":
        setEventTime({ ...eventTime, endDate: value });
        break;
      case "endTime":
        setEventTime({ ...eventTime, endTime: value });
        break;
      default:
        return null;
    }
  };

  useEffect(() => {
    setTimeIsInvalid(false);
  }, []);

  const handleFileChange = (file) => {
    let fileURL;
    if (file) {
      fileURL = URL.createObjectURL(file);
      setUploadImage(fileURL);
    } else {
      setUploadImage(photo);
    }
  };

  const updateEventInfo = async (inputs) => {
    const eventData = await constructEventData(inputs);
    await updateEvent(eventId, eventData);
    toast.success(successAlertText("已更新活動資訊"), {
      position: toast.POSITION.TOP_CENTER,
    });
    history.push("/profile");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const inputs = event.currentTarget;

    const titleIsValid = validateInput(inputs.title.value, setTitleIsInvalid);
    const contentIsValid = validateInput(
      inputs.content.value,
      setContentIsInvalid
    );
    const timeIsValid = validateEventTime(eventTime, setTimeIsInvalid);

    if (!selectedAddress.label) {
      document.querySelector(".css-yk16xz-control").style.border =
        "1px solid red";
    } else {
      document.querySelector(".css-yk16xz-control").style.border =
        "1px solid hsl(0, 0%, 80%)";
    }

    if (
      uploadImage !== eventInfo.eventCoverImage &&
      !inputs.coverImage.files[0]
    ) {
      setImageIsInvalid(true);
      document.querySelector("#coverImage").style.border = "1px solid red";
      document.querySelector("#coverImage").style.borderRadius = "5px";
    } else {
      setImageIsInvalid(false);
      document.querySelector("#coverImage").style.border = "none";
    }

    if (
      titleIsValid &&
      contentIsValid &&
      timeIsValid &&
      selectedAddress.label &&
      (uploadImage === eventInfo.eventCoverImage || inputs.coverImage.files[0])
    ) {
      setSubmmited(true);
      updateEventInfo(inputs);
    } else {
      toast.error(errorAlertText("請確認活動資料"));
    }
  };

  return (
    <Styles>
      {!loading && eventExist && (
        <Container
          className="container-xl"
          onClick={() => dispatch({ type: "SHOW_NAV", data: false })}
        >
          <Background />
          <Mask />

          {getEventData && (
            <CreateEventContainer>
              <Form
                className="px-0 py-3 p-4"
                noValidate
                onSubmit={handleSubmit}
              >
                <Form.Group controlId="title">
                  <Form.Label>活動名稱</Form.Label>
                  <Form.Control
                    type="text"
                    required
                    isInvalid={titleIsInvalid}
                    className="mb-1"
                    defaultValue={eventInfo.eventTitle}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ position: "inherit" }}
                  >
                    請輸入活動名稱
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="content">
                  <Form.Label>活動內容</Form.Label>
                  <Form.Control
                    as="textarea"
                    type="text"
                    rows={3}
                    required
                    isInvalid={contentIsInvalid}
                    className="mb-1"
                    defaultValue={eventInfo.eventContent}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ position: "inherit" }}
                  >
                    請輸入活動內容
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="startTime">
                  <Row>
                    <Col>
                      <Form.Label>開始日期</Form.Label>
                      <Form.Control
                        type="date"
                        defaultValue={eventInfo.startTime.date}
                        min={tomorrowDate}
                        className="mb-1"
                        isInvalid={timeIsInvalid}
                        onChange={(e) => {
                          handleTimeChange("startDate", e.target.value);
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ position: "inherit" }}
                      >
                        開始時間需早於結束時間
                      </Form.Control.Feedback>
                      <Form.Control.Feedback
                        type="valid"
                        style={{ display: "none" }}
                      ></Form.Control.Feedback>
                    </Col>
                    <Col>
                      <Form.Label>時間</Form.Label>
                      <Form.Control
                        type="time"
                        defaultValue={eventInfo.startTime.time}
                        className="mb-1"
                        isInvalid={timeIsInvalid}
                        onChange={(e) => {
                          handleTimeChange("startTime", e.target.value);
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ position: "inherit" }}
                      ></Form.Control.Feedback>
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group controlId="endTime">
                  <Row>
                    <Col>
                      <Form.Label>結束日期</Form.Label>
                      <Form.Control
                        type="date"
                        defaultValue={eventInfo.endTime.date}
                        min={eventTime.startDate}
                        isInvalid={timeIsInvalid}
                        className="mb-1"
                        onChange={(e) => {
                          handleTimeChange("endDate", e.target.value);
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ position: "inherit" }}
                      ></Form.Control.Feedback>
                    </Col>
                    <Col>
                      <Form.Label>時間</Form.Label>
                      <Form.Control
                        type="time"
                        defaultValue={eventInfo.endTime.time}
                        isInvalid={timeIsInvalid}
                        className="mb-1"
                        onChange={(e) => {
                          handleTimeChange("endTime", e.target.value);
                        }}
                      />
                      <Form.Control.Feedback
                        type="invalid"
                        style={{ position: "inherit" }}
                      ></Form.Control.Feedback>
                    </Col>
                  </Row>
                </Form.Group>
                <Form.Group controlId="formEventCoverImage">
                  <Form.Label>活動類型</Form.Label>
                  <Tags>
                    {tags.map((tag, index) =>
                      tag.select ? (
                        <OptionSelected
                          id={tag.id}
                          key={index}
                          onClick={(e) => handleTagClick(e)}
                        >
                          {tag.name}
                        </OptionSelected>
                      ) : (
                        <Option
                          id={tag.id}
                          key={index}
                          onClick={(e) => handleTagClick(e)}
                        >
                          {tag.name}
                        </Option>
                      )
                    )}
                  </Tags>
                </Form.Group>
                <Form.Group controlId="address">
                  <Form.Label>地址</Form.Label>
                  <GooglePlacesAutocomplete
                    placeholder="地址"
                    apiKey={process.env.REACT_APP_AUTOCOMPLETE}
                    selectProps={{
                      selectedAddress,
                      onChange: setSelectedAddress,
                      placeholder: eventInfo.eventAddress.formatted_address,
                    }}
                  />
                  <Form.Control.Feedback
                    type="invalid"
                    style={{ position: "inherit" }}
                  >
                    請填寫正確地址
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Map
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLEMAP}&q=${selectedAddress.label}`}
                  ></Map>
                </Form.Group>
                <Form.Group controlId="coverImage">
                  <Form.Label>更改活動封面</Form.Label>
                  <ImagePreviewDiv>
                    <ImagePreview src={uploadImage} />
                    <StyledFormControl
                      type="file"
                      required
                      className="mb-1"
                      isInvalid={imageIsInvalid}
                      onChange={(e) => handleFileChange(e.target.files[0])}
                    />
                  </ImagePreviewDiv>

                  <Form.Control.Feedback
                    type="invalid"
                    style={{ position: "inherit" }}
                    title=""
                  >
                    請選擇封面圖片
                  </Form.Control.Feedback>
                </Form.Group>
                {submmited ? (
                  <DisabledButton disabled>儲存活動</DisabledButton>
                ) : (
                  <Button type="submit">儲存活動</Button>
                )}
              </Form>
            </CreateEventContainer>
          )}
        </Container>
      )}
    </Styles>
  );
}

export default CreateEvent;
