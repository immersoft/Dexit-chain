

import React,{useEffect,useState} from 'react'

import axios from 'axios';
import ChartViewer from './ChartViewer';
const pdata = [
	{
		name: 'MongoDb',
		student: 11,
		fees: 120
	},
	{
		name: 'Javascript',
		student: 15,
		fees: 12
	},
	{
		name: 'PHP',
		student: 5,
		fees: 10
	},
	{
		name: 'Java',
		student: 10,
		fees: 5
	},
	{
		name: 'C#',
		student: 9,
		fees: 4
	},
	{
		name: 'C++',
		student: 10,
		fees: 8
	},
];

function Graph() {
	const [data, updateData] = useState([]);

	useEffect(() => {
		axios.get("https://final-dxt.herokuapp.com/transactions").then((res)=>{
			// console.log("ressasdjksjkdhdfs",res.data.data)
			updateData(res.data.data);

		})
		// axios.get("https://final-explorer.herokuapp.com/transactions")
        // .then((res) => {
		//  updateData(res.data.data);
        // });
	  }, []);

	return (
		<>
			<ChartViewer data={data} /> 

			{/* <h1 className="text-heading">
				Line Chart Using Rechart
			</h1>

			<ResponsiveContainer width="100%" aspect={3}>
				<LineChart data={pdata} >
					<CartesianGrid />
					<XAxis dataKey="name"
						interval={'preserveStartEnd'} />
					<YAxis></YAxis>
					<Legend />
					<Tooltip />
					<Line dataKey="student"
						stroke="black" activeDot={{ r: 8 }} />
					<Line dataKey="fees"
						stroke="red" activeDot={{ r: 8 }} />
				</LineChart>
			</ResponsiveContainer> */}
		</>
	);
}

export default Graph;
