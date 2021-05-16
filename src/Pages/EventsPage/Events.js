import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { getEvents } from "../../utils/firebase.js";
import { useHistory, useParams } from "react-router-dom";

const Wrapper = styled.div`
  width: 90%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 10px;
  margin: 0 auto;
  margin-top: 20px;
  padding: 10px 0;
`;

const Event = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const EventImage = styled.img`
  width: 100%;
  height: 20vw;
  object-fit: cover;
`;

const EventTime = styled.div`
  font-size: 12px;
  margin-top: 5px;
`;

const EventTitle = styled.div`
  font-size: 16px;
  margin-top: 5px;
`;

function Events() {
  const [events, setEvents] = useState([]);
  const getAllEvents = async () => {
    const newEvents = await getEvents(0);
    newEvents.map((event) => {
      event.startTime = reformatTimestamp(event.startTime);
      event.endTime = reformatTimestamp(event.endTime);
      console.log(event.startTime);
    });
    setEvents(newEvents);
  };

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

  useEffect(() => {
    getAllEvents();
  }, []);

  let history = useHistory();
  const handleEventClick = (id) => {
    history.push(`/events/${id}`);
  };

  return (
    <Wrapper>
      {events.map((event, eventId) => (
        <Event key={eventId} onClick={() => handleEventClick(event.eventId)}>
          <EventImage src={event.eventCoverImage} />
          <EventTime>{`${event.startTime} ~ ${event.endTime}`}</EventTime>
          <EventTitle>{event.eventTitle}</EventTitle>
        </Event>
      ))}
    </Wrapper>
  );
}

export default Events;
