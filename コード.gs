var lineToken = "gZUgeQQ3mqOVukVb9INlEsBLKTbkYrDWYvJ7dLs6fIu"; //LINEのトークン
	
function main() {
  var calendars = CalendarApp.getAllCalendars();
  var calendar = calendars[1]; //自分のカレンダー取得
  var text = ""; //送信メッセージ初期化

  var now = new Date();
  var date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); //明日の日付
  var events = calendar.getEventsForDay(date);  //明日の予定取得
  
  for(j in events) { //予定を1個ずつ見ていく
    var event = events[j]; //ｊ番目の予定を取得
    
    var title = event.getTitle(); //予定のタイトル
    var start = toTime(event.getStartTime()); //開始時刻取得
    var end = toTime(event.getEndTime()); //終了時刻取得
    var at = event.getLocation() //開催場所
    
    //メッセージに追加
    text +=  "\n" + (Number(j) + 1) +". " +title+"\n" +start + ' - ' + end  ;
    if (at !=""){
      text += " @" + at;     //場所があれば追加
    }
  }
  
  if(text ==""){//予定がなかったとき
   text += "\n明日の予定はありません"; 
  }
  
  //続いては天気予報です．
  text += "\n\n[天気予報]"
  //DarkSkyにアクセス． "https://api.darksky.net/forecast/<自分のキー>/<緯度，経度>?units=si&lang=ja&exclude=alerts,flags"
  var response = UrlFetchApp.fetch("https://api.darksky.net/forecast/5148a48499d8365655f583fee463eb0f/34.5454,135.5088?units=si&lang=ja&exclude=alerts,flags"); 
  var retjson = JSON.parse(response.getContentText()); //JSON形式データを配列に格納
  date_data = retjson["daily"]["data"][1] //日報データ
  var date_data_date =Moment.moment.unix(date_data["time"]).format("DD") //日付
  text += "\n" + date_data_date + "日 " +date_data["summary"] +" \n最高気温 " + date_data["temperatureHigh"] + "度 \n最低気温 " + date_data["temperatureLow"] + "度 \n降水確率 " +  Math.round(date_data["precipProbability"]*100) + escape("%");
  
  text += "\n\n[3時間毎の予報]"
  for(item_num in retjson["hourly"]["data"]){
    var item = retjson["hourly"]["data"][item_num];
    var time_a = item["time"]
    var hour =Moment.moment.unix(time_a).format("HH")
    if(hour % 3 == 0){
      text += "\n" + Moment.moment.unix(time_a).format("DD日HH時") + " " + item["summary"] + " " + Math.round(item["temperature"]) + "度 降水確率" + Math.round(item["precipProbability"]*100) + escape("%");
      //text += "\n" + hour + "時:" + item["summary"] + " " + Math.round(item["temperature"]) + "度 降水確率" + Math.round(item["precipProbability"]*100) + escape("%");
    }
    if(hour == 21){
      break;
    }
  }
  
  text += "\n\n[昨日のQiitaベスト5]"
  
  var yesterday =Moment.moment(date).subtract(2,'days').format("YYYY-MM-DD") 
  var response = UrlFetchApp.fetch("https://us-central1-qiita-trend-web-scraping.cloudfunctions.net/qiitaScraiping/daily/"+yesterday); 
  var qiita_ranking = JSON.parse(response.getContentText())["data"]; //JSON形式データを配列に格納
  
  for(var i = 0; i < 5 ; i ++){
    text += "\n" + qiita_ranking[i]["title"] + "\n" + qiita_ranking[i]["url"];
  }
  
  sendToLine(text);
}

	
function sendToLine(text){
  var token = lineToken;
  var options ={
     "method"  : "post",
     "payload" : "message=" + text,
     "headers" : {"Authorization" : "Bearer "+ token}
   };
   UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);
}

function toTime(str){	
  return Utilities.formatDate(str, 'JST', 'HH:mm');
}