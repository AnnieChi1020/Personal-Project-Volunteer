/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getParticipants,
  getEventInfo,
  getParticipantInfo,
  updateParticipantStatus,
} from "../../../../utils/firebase.js";
import { useParams } from "react-router-dom";
import { Col, Card } from "react-bootstrap";
import noParticipantImage from "../../../../images/noParticipant.png";

const EventsContainer = styled.div`
  width: 90%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  background-color: white;
  padding: 10px 20px 20px 20px;
  border-radius: 20px;
  margin-top: 20px;
`;

const Events = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  /* display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-gap: 10px; */
  margin: 0 auto;
  padding: 20px 0;
  /* @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  } */
`;

const EventInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  padding-top: 15px;
  justify-content: flex-start;
`;

const EventText = styled.div`
  font-size: 12px;
  line-height: 20px;
  margin-top: 5px;
`;

// const NoEvent = styled.div`
//   width: 90%;
//   margin: 0 auto;
//   padding: 10px 0;
//   font-size: 16px;
//   line-height: 24px;
//   margin-top: 20px;
//   text-align: center;
// `;

const ConfirmButton = styled.button`
  width: 90px;
  font-size: 14px;
  line-height: 20px;
  padding: 3px 8px;
  margin-right: 8px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: #619e6f;
  color: white;
`;

const styles = {
  cardImage: {
    objectFit: "cover",
    width: "100%",
    height: "150px",
    cursor: "pointer",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: "16px",
  },
  cardCol: {
    overflow: "hidden",
    minWidth: "200px",
  },
};

const Title = styled.div`
  font-size: 20px;
  line-height: 30px;
  padding: 5px;
  margin: 0 auto;
  margin-top: 15px;
  margin-bottom: 10px;
  text-align: center;
  border-bottom: 3px solid #619e6f;
`;

const NoResultDiv = styled.div`
  width: 200px;
  font-size: 16px;
  line-height: 20px;
  padding: 10px 0;
  color: #949494;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const NoResultImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: contain;
  margin-right: 5px;
  margin-left: 5px;
`;

const NoResultText = styled.div`
  position: absolute;
  top: 32px;
  left: 50px;
  color: #3d3d3d;
`;

const Styles = styled.div`
  .eventCard {
    border: 1px solid rgba(0, 0, 0, 0.125);
  }
  .col {
    min-width: 200px !important;
    flex-grow: 0;
    justify-content: flex-start;
  }
`;

function ParticipantList() {
  let { id } = useParams();
  const eventId = id;

  const [participants, setParticipants] = useState([]);
  const [noParticipant, setNoParticipant] = useState(false);

  const getParticipantsData = async () => {
    const newParticipants = await getParticipants(eventId, 1);
    let participantsArray = [];

    newParticipants.forEach((e) => {
      participantsArray.push(e.participantInfo);
    });

    if (participantsArray.length === 0) {
      setNoParticipant(true);
    }
    setParticipants([...participantsArray]);
  };

  useEffect(() => {
    getParticipantsData();
  }, []);

  const [event, setEvent] = useState({
    id: "",
    image: "",
    title: "",
    content: "",
    address: "",
    location: {},
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    async function getEventDetail() {
      const data = await getEventInfo(eventId);

      setEvent({
        ...event,
        id: data.eventId,
        image: data.eventCoverImage,
        title: data.eventTitle,
        content: data.eventContent,
        address: data.eventAddress,
        location: data.eventLocation,
        startTime: data.startTime,
        endTime: data.endTime,
      });
    }
    getEventDetail();
  }, []);

  const handleAttendClick = async (eventId, userId) => {
    let currentStatus = await getParticipantInfo(eventId, userId);
    currentStatus.participantInfo.participantAttended = true;
    updateParticipantStatus(eventId, userId, currentStatus);
  };

  const renderButton = (e) => {
    const startT = event.startTime.seconds * 1000;
    const currentT = new Date().getTime();
    const eventPassed = startT < currentT;
    return e.participantAttended === false && eventPassed ? (
      <ConfirmButton
        id={e.participantId}
        onClick={(e) => {
          handleAttendClick(eventId, e.target.id);
          e.target.textContent = "已確認出席";
          e.target.disabled = true;
          e.target.style.opacity = "0.6";
        }}
      >
        確認出席
      </ConfirmButton>
    ) : !eventPassed ? (
      <ConfirmButton disabled style={{ opacity: "0.6" }}>
        確認出席
      </ConfirmButton>
    ) : (
      <ConfirmButton disabled style={{ opacity: "0.6" }}>
        已確認出席
      </ConfirmButton>
    );
  };

  const renderNoResultMessage = () => {
    if (noParticipant) {
      return (
        <NoResultDiv>
          <NoResultImage src={noParticipantImage} />
          <NoResultText>尚無參加者哦</NoResultText>
        </NoResultDiv>
      );
    }
  };

  return (
    <Styles>
      <EventsContainer>
        <Title>活動參加名單</Title>
        <Events>
          {participants.map((participant, index) => (
            <Col className="p-1 col" key={index}>
              <Card className="h-100 eventCard">
                <Card.Body style={styles.cardBody}>
                  <EventInfo>
                    <Card.Title style={styles.cardTitle}>
                      {participant.participantName}
                    </Card.Title>
                    <Card.Text>
                      <EventText>{participant.participantPhone}</EventText>
                      <EventText>{participant.participantEmail}</EventText>
                    </Card.Text>
                  </EventInfo>
                  <ButtonsContainer>
                    {renderButton(participant)}
                  </ButtonsContainer>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {renderNoResultMessage()}
        </Events>
      </EventsContainer>
    </Styles>
  );
}

export default ParticipantList;
