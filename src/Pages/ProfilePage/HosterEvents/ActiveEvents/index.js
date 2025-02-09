import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  getHosterEvents,
  getEventInfo,
  updateEvent,
  getParticipants,
  updateParticipantStatus,
} from "../../../../utils/firebase.js";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { Col, Card, Modal } from "react-bootstrap";
import NoEvent from "../../components/NoEvent.js";
import { toast } from "react-toastify";
import { successAlertText } from "../../../../components/Alert.js";
import { reformatTimestamp } from "../../../../utils/time.js";

const EventsContainer = styled.div`
  width: 90%;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;

const Events = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  margin: 0 auto;
  padding: 20px 0;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const CurrentStatus = styled.div`
  font-size: 14px;
  line-height: 20px;
  padding: 3px 8px;
  position: absolute;
  top: 10px;
  left: 0px;
  background-color: rgb(251, 251, 251, 0.6);
  color: rgb(0, 0, 0, 0.9);
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

const PrimaryButton = styled.button`
  width: 85px;
  flex-grow: 1;
  font-size: 14px;
  line-height: 20px;
  padding: 3px 0;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: #80ae7f;
  color: white;
`;

const SecondaryButton = styled(PrimaryButton)`
  width: 73px;
  margin-left: 4px;
  border-color: #89b485;
  background-color: white;
  color: #719b6d;
`;

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const ActionButton = styled.button`
  font-size: 16px;
  line-height: 20px;
  padding: 5px 15px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: #80ae7f;
  color: white;
`;

const StyledHeader = styled(Modal.Header)`
  border: none;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  padding: 25px 30px 20px 30px;
  color: #747272;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #ececec;
`;

const CancelText = styled.div`
  width: 100%;
  text-align: center;
`;

const StyledBody = styled(Modal.Body)`
  padding: 25px 30px 25px 30px;
`;

const ModalButtonsContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
`;

const ModalPrimaryButton = styled.button`
  width: 100%;
  font-size: 14px;
  line-height: 20px;
  padding: 3px 5px;
  border: 1px solid #ced4da;
  border-radius: 5px;
  background-color: #80ae7f;
  color: white;
  margin: 0 auto;
  cursor: pointer;
`;

const ModalSecondaryButton = styled(ModalPrimaryButton)`
  border-color: #89b485;
  background-color: white;
  color: #719b6d;
`;

const CardImage = styled(Card.Img)`
  object-fit: cover;
  width: 100%;
  height: 150px;
  cursor: pointer;
`;

const CardBody = styled(Card.Body)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardTitle = styled(Card.Title)`
  font-size: 16px;
`;

const CardCol = styled(Col)`
  overflow: hidden;
`;

const StyledCard = styled(Card)`
  border: 1px solid rgba(0, 0, 0, 0.125);
`;

const USER_APPLYING = 0;
const USER_CONFIRMED = 1;
const USER_CANCELLED = 9;
const EVENT_ACTIVE = 0;
const EVENT_CANCELLED = 9;

function ActiveEvents() {
  const hosterId = useSelector((state) => state.isLogged.userId);
  const [events, setEvents] = useState([]);
  const [noEvent, setNoEvent] = useState(false);
  let history = useHistory();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelEvent, setCancelEvent] = useState({
    eventId: "",
  });

  const getActiveEvents = async () => {
    const newEvents = await getHosterEvents(hosterId, EVENT_ACTIVE);
    setEvents(newEvents);
    if (newEvents.length === 0) {
      setNoEvent(true);
    }
  };

  useEffect(() => {
    getActiveEvents();
    // eslint-disable-next-line
  }, []);

  const handleParticipantClick = (id) => {
    history.push(`profile/manage-participants/${id}`);
  };

  const handleEditClick = async (id) => {
    history.push(`profile/edit-event/${id}`);
  };

  const updateParticipantsStatus = async (eventId, currentStatus) => {
    const participants = await getParticipants(eventId, currentStatus);
    participants.forEach((participant) => {
      participant.participantInfo.participantStatus = USER_CANCELLED;
      updateParticipantStatus(
        eventId,
        participant.participantInfo.participantId,
        participant
      );
    });
  };

  const handleCancelClick = async (id) => {
    const eventData = await getEventInfo(id);
    eventData.eventStatus = EVENT_CANCELLED;
    updateEvent(id, eventData);
    let newEventsArray = events;
    newEventsArray.forEach((event) => {
      if (event.eventId === id) {
        event.eventStatus = EVENT_CANCELLED;
      }
    });
    setEvents(newEventsArray);

    updateParticipantsStatus(id, USER_APPLYING);
    updateParticipantsStatus(id, USER_CONFIRMED);

    toast.success(successAlertText("成功取消活動"), {
      position: toast.POSITION.TOP_CENTER,
    });
    setShowCancelModal(false);
  };

  const handleEventClick = (e) => {
    history.push(`/events/${e}`);
  };

  const handleActionClick = () => {
    history.push(`/createEvent`);
  };

  const handleClose = () => setShowCancelModal(false);
  const handleShow = (eventId) => {
    setShowCancelModal(true);
    setCancelEvent({ ...cancelEvent, eventId: eventId });
  };

  const renderNoEventMessage = () => {
    if (noEvent) {
      return (
        <div>
          <NoEvent></NoEvent>
          <ButtonContainer>
            <ActionButton onClick={handleActionClick}>創建新活動</ActionButton>
          </ButtonContainer>
        </div>
      );
    }
  };

  return (
    <div>
      <EventsContainer>
        {events.length > 0 && (
          <Events>
            {events.map((event, index) => (
              <CardCol className="p-0" key={index}>
                <StyledCard className="h-100">
                  <CurrentStatus>招募中</CurrentStatus>
                  <CardImage
                    variant="top"
                    src={event.eventCoverImage}
                    alt="eventCoverImage"
                    onClick={() => handleEventClick(event.eventId)}
                  />
                  <CardBody>
                    <EventInfo>
                      <CardTitle>{event.eventTitle}</CardTitle>
                      <Card.Text>
                        <EventText>{`${reformatTimestamp(
                          event.startTime
                        )} ~ ${reformatTimestamp(event.endTime)}`}</EventText>
                        <EventText>
                          {event.eventAddress.formatted_address}
                        </EventText>
                      </Card.Text>
                    </EventInfo>
                    <ButtonsContainer>
                      <PrimaryButton
                        onClick={() => handleParticipantClick(event.eventId)}
                      >
                        管理參加者
                      </PrimaryButton>
                      <SecondaryButton
                        onClick={() => handleEditClick(event.eventId)}
                      >
                        編輯活動
                      </SecondaryButton>
                      {event.eventStatus === EVENT_CANCELLED ? (
                        <SecondaryButton disabled style={{ opacity: ".6" }}>
                          已取消
                        </SecondaryButton>
                      ) : (
                        <SecondaryButton
                          onClick={(e) => {
                            handleShow(event.eventId);
                          }}
                        >
                          取消活動
                        </SecondaryButton>
                      )}
                    </ButtonsContainer>
                  </CardBody>
                </StyledCard>
              </CardCol>
            ))}
          </Events>
        )}
        {renderNoEventMessage()}
      </EventsContainer>
      <Modal
        show={showCancelModal}
        onHide={handleClose}
        centered
        dialogClassName="cancel-modal"
        size="sm"
      >
        <StyledHeader>
          <CancelText>確定要取消活動嗎</CancelText>
        </StyledHeader>
        <StyledBody>
          <ModalButtonsContainer>
            <ModalSecondaryButton onClick={() => handleClose()}>
              再想一下
            </ModalSecondaryButton>
            <ModalPrimaryButton
              onClick={() =>
                handleCancelClick(cancelEvent.eventId, cancelEvent.userId)
              }
            >
              取消活動
            </ModalPrimaryButton>
          </ModalButtonsContainer>
        </StyledBody>
      </Modal>
    </div>
  );
}

export default ActiveEvents;
