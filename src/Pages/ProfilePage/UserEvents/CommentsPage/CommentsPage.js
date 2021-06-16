/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import ReactStars from "react-rating-stars-component";
import {
  getEventInfo,
  getParticipantInfo,
  updateParticipantStatus,
} from "../../../../utils/firebase.js";
import { Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { toast } from "react-toastify";
import {
  successAlertText,
  errorAlertText,
} from "../../../../components/Alert.js";

// const Background = styled.div`
//   width: 100%;
//   height: 100%;
//   background-image: url(${background});
//   background-position: center;
//   background-repeat: no-repeat;
//   background-size: cover;
//   position: fixed;
//   top: 0;
//   left: 0;
//   z-index: -1;
// `;

// const Mask = styled.div`
//   width: 100%;
//   height: 100%;
//   background-color: rgb(0, 0, 0, 0.5);
//   position: fixed;
//   top: 0;
//   left: 0;
//   z-index: -1;
// `;

// const Container = styled.div`
//   width: 100%;
//   margin: 0 auto;
//   margin-top: 0px;
//   min-height: calc(100vh - 200px);
// `;

// const CommentContainer = styled.div`
//   width: 80%;
//   display: flex;
//   margin: 0 auto;
//   margin-top: 120px;
//   margin-bottom: 100px;
//   flex-direction: column;
//   padding: 20px 30px;
//   background-color: white;
//   border-radius: 8px;
//   border: solid 1px #979797;
//   @media (max-width: 760px) {
//     width: 95%;
//   }
// `;

const CommentContainer = styled.div`
  width: 100%;
`;

const Event = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
`;

const EventTitle = styled.div`
  font-size: 20px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  margin-top: 10px;
  margin-bottom: 15px;
  @media (max-width: 760px) {
    font-size: 16px;
    line-height: 20px;
  }
`;

const EventInfo = styled.div`
  font-size: 14px;
  line-height: 24px;
  color: rgba(0, 0, 0, 0.6);
  @media (max-width: 760px) {
    font-size: 14px;
    line-height: 18px;
  }
`;

const FormLabel = styled.div`
  margin-bottom: 0.5rem;
  color: rgba(0, 0, 0, 0.6);
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
`;

const ButtonContainer = styled.div`
  width: 100%;
  text-align: center;
`;

const SubmitButton = styled.button`
  font-size: 14px;
  line-height: 24px;
  padding: 5px 20px;
  margin: 0 auto;
  margin-top: 20px;
  margin-bottom: 10px;
  border: 1px solid #ced4da;
  border-radius: 20px;
  background-color: #1190cb;
  color: white;
`;

function Comments() {
  // const { id } = useParams();

  const dispatch = useDispatch();

  const participantId = useSelector((state) => state.isLogged.userId);
  const eventId = useSelector((state) => state.modal.eventId);

  // const [rateIsInvalid, setRateIsInvalid] = useState(false);

  // const eventId = id;
  let rating = 0;
  let comment = "";

  const getDay = (day) => {
    const dayArray = ["日", "一", "二", "三", "四", "五", "六"];
    return dayArray[day];
  };

  const reformatTimestamp = (timestamp) => {
    const year = timestamp.toDate().getFullYear();
    const month = timestamp.toDate().getMonth() + 1;
    const date = timestamp.toDate().getDate();
    const day = getDay(timestamp.toDate().getDay());
    const time = timestamp.toDate().toTimeString().slice(0, 5);
    const reformatedTime = `${year}-${month}-${date}(${day}) ${time}`;
    return reformatedTime;
  };

  const [eventInfo, setEventInfo] = useState({
    id: "",
    title: "",
    startTime: "",
    endTime: "",
    address: "",
    content: "",
  });

  const getEventDetail = async () => {
    const event = await getEventInfo(eventId);
    setEventInfo({
      ...eventInfo,
      id: event.eventId,
      title: event.eventTitle,
      startTime: reformatTimestamp(event.startTime),
      endTime: reformatTimestamp(event.endTime),
      address: event.eventAddress.formatted_address,
      content: event.eventContent,
    });
  };

  useEffect(() => {
    getEventDetail();
  }, []);

  useEffect(() => {}, [eventInfo]);

  const ratingChanged = (newRating) => {
    rating = newRating;
    return rating;
  };

  const commentChanged = (newComment) => {
    comment = newComment;
    return comment;
  };

  const handelClickSubmit = async () => {
    if (rating === 0) {
      toast.error(errorAlertText("請填寫活動評分"), {
        position: toast.POSITION.TOP_CENTER,
      });
    } else if (!comment) {
      toast.error(errorAlertText("請填寫活動評價"), {
        position: toast.POSITION.TOP_CENTER,
      });
    } else {
      const currentStatus = await getParticipantInfo(
        eventInfo.id,
        participantId
      );
      currentStatus.participantInfo.participantComment = comment;
      currentStatus.participantInfo.participantRating = rating;
      await updateParticipantStatus(eventInfo.id, participantId, currentStatus);
      dispatch({ type: "SET_FEEDBACKCOMPLETED", data: true });
      toast.success(successAlertText("已送出評價"), {
        position: toast.POSITION.TOP_CENTER,
      });
      dispatch({ type: "SHOW_FEEDBACK", data: false });
    }
  };

  return (
    <CommentContainer>
      <Event>
        <EventTitle>{eventInfo.title}</EventTitle>
        <EventInfo>{`${eventInfo.startTime} - ${eventInfo.endTime}`}</EventInfo>
        <EventInfo>{eventInfo.address}</EventInfo>
      </Event>
      <Form>
        <Form.Group>
          <FormLabel className="mb-0">活動評分 (必填)</FormLabel>
          <ReactStars
            count={5}
            onChange={ratingChanged}
            size={24}
            height={"20px"}
            activeColor="#ffd700"
          />
        </Form.Group>
        <Form.Group>
          <FormLabel>活動評價</FormLabel>
          <Form.Control
            as="textarea"
            rows={3}
            onChange={(e) => commentChanged(e.target.value)}
          />
        </Form.Group>
      </Form>
      <ButtonContainer>
        <SubmitButton onClick={handelClickSubmit}>送出評價</SubmitButton>
      </ButtonContainer>
    </CommentContainer>
  );
}

export default Comments;
