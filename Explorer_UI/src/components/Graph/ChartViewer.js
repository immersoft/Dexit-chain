import React from "react";
import Chart from "react-apexcharts";

export default function ChartViewer(props) {
  // console.log("fatataqtata----",props)
  let a;
  //   const ref = useRef("");
  //   useEffect(() => {
  //     return () => {};
  //   }, []);
  //   // console.log("props", props)
  //   try {
  //     a = props.data.map((a) => a.date);
  //   } catch (error) {
  //     a = [];
  //   }
  // let b = props.data.map((b) => b.time);
  // var date = new Date();
  React.useEffect(() => {
  }, []);
  const series = [
    {
      name: "series-1",
      data: props.data.map((a) => a.totalcount),
    },
  ];
  const options = {
    chart: {
      height: 350,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      text: "Product Trends by Month",
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
        opacity: 0.5,
      },
    },
    xaxis: {
      type: "category",
      // categories:
      //   props.data.length > 0
      //     ? props.data.map((a) => {
      //         let date = a.date;
      //         let [ab, bc, cd] = date.split("/");
      //         let newDate = new Date(cd, bc, ab);
      //         let longMonth = newDate.toLocaleString("en-us", {
      //           month: "short",
      //         });
      //         // if (parseInt(ab) % 5 == 0) {
      //         //   return a.date;
      //         // } else {
      //         //   return "";
      //         // }
      //         return a.date
      //       })
      //     : [],

      tickAmount: undefined,
      tickPlacement: "between",
      min: undefined,
      max: undefined,
      range: undefined,
      floating: false,
      decimalsInFloat: undefined,
      overwriteCategories: undefined,
      position: "bottom",
      labels: {
        show: true,
        rotate: -45,
        rotateAlways: false,
        hideOverlappingLabels: true,
        showDuplicates: false,
        trim: false,
        minHeight: undefined,
        maxHeight: 120,
        style: {
          colors: [],
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 400,
          cssClass: "apexcharts-xaxis-label",
        },
        offsetX: 0,
        offsetY: 0,
        format: undefined,
        // formatter: function (value) {
        //   if (props.data.length) {
        //     return props.data.map((e,index) => {
        //       let date = e.date;
        //       let [ab, bc, cd] = date.split("/");
        //       let newDate = new Date(cd, bc, ab);
        //       let longMonth = newDate.toLocaleString("en-us", {
        //         month: "short",
        //       });
        //       if (parseInt(ab) == 5 ||parseInt(ab) == 25 ) {
        //         return longMonth + " " + ab;

        //       } else {
        //         return "";

        //       }
        //     });
        //   }
        // },
        datetimeUTC: true,
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM 'yy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
      axisBorder: {
        show: true,
        color: "#78909C",
        height: 1,
        width: "100%",
        offsetX: 0,
        offsetY: 0,
      },
      axisTicks: {
        show: true,
        borderType: "solid",
        color: "#78909C",
        height: 6,
        offsetX: 0,
        offsetY: 0,
      },

      title: {
        text: undefined,
        offsetX: 0,
        offsetY: 0,
        style: {
          color: undefined,
          fontSize: "12px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: 600,
          cssClass: "apexcharts-xaxis-title",
        },
      },
      crosshairs: {
        show: true,
        width: 1,
        position: "back",
        opacity: 0.9,
        stroke: {
          color: "#b6b6b6",
          width: 0,
          dashArray: 0,
        },
        fill: {
          type: "solid",
          color: "#B1B9C4",
          gradient: {
            colorFrom: "#D8E3F0",
            colorTo: "#BED1E6",
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
        dropShadow: {
          enabled: false,
          top: 0,
          left: 0,
          blur: 1,
          opacity: 0.4,
        },
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: 0,
          fontFamily: 0,
        },
      },
    },

    yaxis: {
      categories: props.data.length ? props.data.map((a) => a.txCount) : [],
    },
  };
  return (
    <>
      <div>
        {/* <p className="text-center text-danger fw-bold">{props.title}</p> */}
        <Chart
          options={options}
          //   ref={ref}
          series={series}
          type="line"
          // minHeight="20vh"
          //   width={"100%"}
          //   height={}
        />
      </div>
    </>
  );
}
