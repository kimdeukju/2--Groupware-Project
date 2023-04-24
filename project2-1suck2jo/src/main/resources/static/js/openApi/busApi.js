
const busDetail=document.querySelector('.bus-detail')
let tbodyTag=document.querySelector('#bus1');


function busSearch(){

  let html1="";


  let search=document.querySelector('#search')

  let strSrch=search.value;
  console.log(strSrch +' < - strSearch2222 ')

    let apiUrl= `/api/busList?strSrch=${strSrch}`;

  console.log(apiUrl +' < - apiUrl ')
     fetch(apiUrl)
    .then(response => response.json())
     .then(function (msg) { //아래부터는 html로 가져오기 위한 코드-->

              console.log(msg)
//                let jsonRs= JSON.parse(msg.rs);
                let jsonRs= JSON.parse(msg.busList);

               jsonRs.msgBody.itemList.forEach(el=>{

                       html1 += "<tr>";
                        html1+=`
                                                <td>${el.busRouteNm}</td>
                                                 <td>${el.routeType}</td>
                                                 <td>${el.edStationNm}</td>
                                                 <td>${el.stStationNm}</td>
                                                 <td>${el.firstBusTm}</td>
                                                 <td>${el.lastBusTm}</td>
                                                 <td>${el.term}</td>
                            <td onclick='stationPost(event.target.innerText)' style="background-color:#ffff00">${el.busRouteId}</td>
                              <td>${el.routeType}</td>
                        `;
                         html1 += "</tr>";
                  });
                 // console.log(html1+" << ")

                  tbodyTag.innerHTML=html1
    });
}

(
    ()=>{
    busSearch()
    }
)();





// 버스 정류장 조회
//var url = 'https://cors-anywhere.herokuapp.com/http://ws.bus.go.kr/api/rest/busRouteInfo/geStaionByRoute?serviceKey=키값&busRouteId=버스ID&resultType=json'; /*URL*/
let stationNmTag= document.querySelector('.stationNm');
function stationPost(busId){
  let html1="";

  let type='busRouteInfo/getStaionByRoute?';
//  let busRouteId=busId;     //<<위에 펑션 변수이름쓴거다

//  let apiUrl=`${url}busRouteInfo/getStaionByRoute?serviceKey=${serviceKey}&busRouteId=${busRouteId}&resultType=json`;
//let apiUrl= `/api/busId?busRouteId=${busRouteId}`;
let apiUrl= `/api/busId1?busRouteId=${busId}`;   //${ ? }펑션변수이름

 fetch(apiUrl)
    .then(response => response.json())
     .then(function (msg) { //아래부터는 html로 가져오기 위한 코드-->

              console.log(msg+"  <<<")

        let jsonRs= JSON.parse(msg.busId3);


               jsonRs.msgBody.itemList.forEach(el=>{
                    //   console.log(el);
                    console.log(el.gpsX, el.gpsY,el.stationNm); // kakao map 표시
                    html1+=`<div>${el.stationNm}</div>`;
               })

               stationNmTag.innerHTML=html1;

                positionFn(jsonRs.msgBody.itemList);

    });

}


   function positionFn(dataVal) {

     let positions = [];

     let lat = 0;
     let lng = 0;

     dataVal.forEach((el, idx) => {
       lat = el.gpsY;
       lng = el.gpsX;

       let result = {
         title: el.stationNm,
         latlng: new kakao.maps.LatLng(parseFloat(lat), parseFloat(lng))
       };
       positions.push(result);
     });


     let mapContainer = document.getElementById('map'), // 지도를 표시할 div
       mapOption = {
         center: new kakao.maps.LatLng(dataVal[0].gpsY, dataVal[0].gpsX), // 지도의 중심좌표
         level: 5 // 지도의 확대 레벨
       };

     // 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
     let map = new kakao.maps.Map(mapContainer, mapOption);
     // 주소-좌표 변환 객체를 생성합니다
     let geocoder = new kakao.maps.services.Geocoder();

     // 마커 이미지의 이미지 주소입니다
     let imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

     for (let i = 0; i < dataVal.length; i++) {
       // 마커 이미지의 이미지 크기 입니다
       let imageSize = new kakao.maps.Size(24, 35);
       // 마커 이미지를 생성합니다
       let markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
       // 마커를 생성합니다
       let marker = new kakao.maps.Marker({
         map: map, // 마커를 표시할 지도
         position: positions[i].latlng, // 마커를 표시할 위치
         title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
         image: markerImage // 마커 이미지
       });
     } //for

     map.setCenter(positions[0].latlng); //기점 을 중심좌표


   }