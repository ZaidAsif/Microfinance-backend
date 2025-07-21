import dayjs from 'dayjs';
import Appointments from '../models/appointment.js'

export const getNextAvailableSlot = async () => {
  const officeHours = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM"];
  let date = dayjs().startOf('day').add(1, 'day');

  while (true) {
    for (let time of officeHours) {
      const existing = await Appointments.findOne({ date: date.toDate(), time });
      if (!existing) {
        return { date: date.toDate(), time };
      }
    }
    date = date.add(1, 'day');
  }
};
