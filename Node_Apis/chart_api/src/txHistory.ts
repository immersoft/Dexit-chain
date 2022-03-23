import moment from 'moment'


function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
export const transactionHistoryCount = [
    {
        "id":uuidv4(),
        "date": '21/02/2022',
        "txCount": 3426578,
      },
      {
        "id":uuidv4(),
        "date":'22/02/2022',
        "txCount": 34265458,
      },
      {
        "id":uuidv4(),
        "date": '23/02/2022',
        "txCount": 342645578,
      },
      {
        "id":uuidv4(),
        "date": '24/02/2022',
        "txCount": 34264567578,
      },
]