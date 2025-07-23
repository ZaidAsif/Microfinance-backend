import dayjs from 'dayjs';
import Appointments from '../models/appointment.js';

export const getNextAvailableSlot = async () => {
  const officeHours = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"];
  let date = dayjs().startOf('day').add(1, 'day'); 

  while (true) {
    const startOfDay = date.startOf('day').toDate();
    const endOfDay = date.endOf('day').toDate();

    const appointments = await Appointments.find({
      date: { $gte: startOfDay, $lte: endOfDay }
    }).lean();

    const bookedTimes = new Set(appointments.map(app => app.time));

    for (let time of officeHours) {
      if (!bookedTimes.has(time)) {
        return { date: startOfDay, time };
      }
    }

    date = date.add(1, 'day'); 
  }
};
