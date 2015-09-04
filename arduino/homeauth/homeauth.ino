// =======================================================================================================
//
// CONFIGURATION
//
// =======================================================================================================

/*
 * http://host/
 * http://host/json
 * http://host/form
 */
#include "DHT.h"
#include "SPI.h"
#include "Ethernet.h"
//#define WEBDUINO_SERIAL_DEBUGGING 1
#include "WebServer.h"
#include "avr/pgmspace.h" // new include

#define VERSION_STRING "0.1"

// TEMP & HUMIDITY
#define DHTPIN A1
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);

// no-cost stream operator as described at 
// http://sundial.org/arduino/?page_id=119
template<class T>
inline Print &operator <<(Print &obj, T arg)
{ obj.print(arg); return obj; }

/*
P(Page_start) = "<html><head><title>Web_Parms_1 Version " VERSION_STRING "</title></head><body>\n";
P(Page_end) = "</body></html>";
P(Get_head) = "<h1>GET from ";
P(Post_head) = "<h1>POST to ";
P(Unknown_head) = "<h1>UNKNOWN request for ";
P(Default_head) = "unidentified URL requested.</h1><br>\n";
P(Raw_head) = "raw.html requested.</h1><br>\n";
P(Parsed_head) = "parsed.html requested.</h1><br>\n";
P(Good_tail_begin) = "URL tail = '";
P(Bad_tail_begin) = "INCOMPLETE URL tail = '";
P(Tail_end) = "'<br>\n";
P(Parsed_tail_begin) = "URL parameters:<br>\n";
P(Parsed_item_separator) = " = '";
P(Params_end) = "End of parameters<br>\n";
P(Post_params_begin) = "Parameters sent by POST:<br>\n";
P(Line_break) = "<br>\n";
*/

// MAC
static uint8_t mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
// IP
static uint8_t ip[] = { 192, 168, 1, 210 };

#define PREFIX ""

WebServer webserver(PREFIX, 80);

// they can read any posted data from client, and they output to server
#define NAMELEN 32
#define VALUELEN 32


// MY OWN CONFIG
boolean autoMode = true;
int darknessLimit = 600;
int lightSensor = A0;
int detectorSensor = 2;
int lightSwitch = 7;

int lightTreshold = 100;
int interval=15000;
unsigned long previousMillis=0;
unsigned long currentMillis;

// =======================================================================================================
//
// CONTROLLERS
//
// =======================================================================================================

// JSON CONTROLLER
// CREATES A JSON WITH THE PINS VALUES
void jsonCtrl(WebServer &server, WebServer::ConnectionType type, char *url_tail, bool tail_complete)
{
  URLPARAM_RESULT rc;
  char name[NAMELEN];
  char value[VALUELEN];
  char* fuCllbck;
  
  if(type == WebServer::POST){
    Serial.println("post........");
    return;
  }
   
  // testing still
  //server.httpSuccess(false, "application/json");
  server.httpSuccess();
  
  if (type == WebServer::HEAD) {
    return;
  }

  if(strlen(url_tail)) {
    while (strlen(url_tail)) {
      rc = server.nextURLparam(&url_tail, name, NAMELEN, value, VALUELEN);
      if (rc == URLPARAM_EOS){
        Serial.print("end of params");
      } else {
        //Serial.println(value);
        fuCllbck = value;
      }
    }
  }
  
  // temp & humidity
  // Sensor readings may also be up to 2 seconds 'old' (its a very slow sensor)
  float h = dht.readHumidity();
  // Read temperature as Celsius (the default)
  float t = dht.readTemperature();
      
  int i;    
  server << fuCllbck << "({ ";
 
  server << "\"tmp\": " << t << ", ";
  server << "\"hdy\": " << h << ", ";
  
  // Digital Pins JSON
  for (i = 0; i <= 9; ++i) {
    int val = digitalRead(i);
    server << "\"d" << i << "\": " << val << ", ";
  }
  // Analog Pins JSON
  for(i = 0; i <= 5; ++i) {
    int val = analogRead(i);
    server << "\"a" << i << "\": " << val;
    if(i != 5) {
      server << ", ";
    }
  }
  server << " });";
}

// OUTPUT PINS FUNCTION
// SHOWS THE PINS VALUES
void outputPins(WebServer &server, WebServer::ConnectionType type, bool addControls = false)
{
  P(htmlHead) =
  "<html>"
  "<head>"
  "<title>Arduino Web Server</title>"
  "<style type=\"text/css\">"
  "BODY { font-family: sans-serif }"
  "H1 { font-size: 14pt; text-decoration: underline }"
  "P  { font-size: 10pt; }"
  "</style>"
  "</head>"
  "<body>";

  int i;
  server.httpSuccess();
  server.printP(htmlHead);
  
  if(addControls){
    server << "<form action='" PREFIX "/form' method='post'>";
  }
  server << "<h1>Digital Pins</h1><p>";
  for (i = 4; i <= 9; ++i) {
    // ignore the pins we use to talk to the Ethernet chip
    int val = digitalRead(i);
    server << "Digital " << i << ": ";
    if(addControls){
      char pinName[4];
      pinName[0] = 'd';
      itoa(i, pinName + 1, 10);
      server.radioButton(pinName, "1", "On", val);
      server << " ";
      server.radioButton(pinName, "0", "Off", !val);
    } else {
      server << (val ? "HIGH" : "LOW");
    }
    server << "<br/>";
  }
  
  server << "</p><h1>Analog Pins</h1><p>";
  for (i = 0; i <= 5; ++i){
    int val = analogRead(i);
    server << "Analog " << i << ": " << val << "<br/>";
  }

  server << "</p>";

  if(addControls){
    server << "<input type='submit' value='Submit'/></form>";
  }
  server << "</body></html>";
}

// POST CONTROLLER
// IT SWITCHES THE PINS TO HIGH OR LOW
void postCtrl(WebServer &server, WebServer::ConnectionType type, char *url_tail, bool tail_complete)
{ 
  if (type == WebServer::POST){
    bool repeat;
    char name[16], value[16];
    do {
      repeat = server.readPOSTparam(name, 16, value, 16);
      if(name[0] == 'd'){
        int pin = strtoul(name + 1, NULL, 10);
        int val = strtoul(value, NULL, 10);
        digitalWrite(pin, val);
        /*
        Serial.print("pin: ");
        Serial.print(pin);
        Serial.print(" - val: ");
        Serial.println(val);
        */
      }
    } while (repeat);
      
    server.httpSeeOther(PREFIX "/form");
  } else {
    outputPins(server, type, true);
  }
}

// POST CONTROLLER BY AJAX
// IT SWITCHES THE PINS TO HIGH OR LOW
void ajaxPostCtrl(WebServer &server, WebServer::ConnectionType type, char *url_tail, bool tail_complete)
{
  if (type == WebServer::POST){
    bool repeat;
    char name[16], value[16];
    do {
      repeat = server.readPOSTparam(name, 16, value, 16);
      if(name[0] == 'd'){
        int pin = strtoul(name + 1, NULL, 10);
        int val = strtoul(value, NULL, 10);
        digitalWrite(pin, val);
        
        Serial.print("pin: ");
        Serial.print(pin);
        Serial.print(" - val: ");
        Serial.println(val); 
      }
    } while (repeat);
    
      P(htmlHead) =
      "Data recieved!";
      
      server.httpSuccess();
      server.printP(htmlHead);
      
    //server.httpSeeOther(PREFIX "/form");
  } else {
    outputPins(server, type, true);
  }
}

// DEFAULT CONTROLLER
// CALLS THE FUNCTION TO SHOW THE PINS VALUES
void defaultCtrl(WebServer &server, WebServer::ConnectionType type, char *url_tail, bool tail_complete){
  outputPins(server, type, false);  
}

/*
void lightCtrl(){
  
  if(autoMode){
    if(isDark()){
      currentMillis = millis();
      if(isSomeoneInside()){
        digitalWrite(lightSwitch, HIGH);
        //Serial.println("turned light on");
        previousMillis = currentMillis;
        
      } else {
        if ((unsigned long)(currentMillis - previousMillis) >= interval) {
          digitalWrite(lightSwitch, LOW);
        }else{
          //Serial.println((currentMillis - previousMillis)/1000);
        }
      }
    }else{
      digitalWrite(lightSwitch, LOW);      
    }
  }
}

bool isDark(){
  //Serial.println(analogRead(lightSensor));
    
  if(analogRead(lightSensor)<darknessLimit){
    return true;
  } else {
    return false;
  }

}

bool isSomeoneInside(){
  if(digitalRead(detectorSensor)==1){
    return true;
  } else {
    return false;
  }
}
*/



int  threshold = 0;
int lightLevel = 450;

bool isLightOn = false;

/* -----------------------------------------
// DOORS & TIMERS
/ --------------------------------------- */

bool timerDoor[];
unsigned long timerTime[];

void setDoor(timerId, boolType){
  if(boolType=="open"){
    timerDoor[timerId] = true;
  } else {
    timerDoor[timerId] = false;
  }
}

bool checkDoorOpen(timerId){
  if(timerDoor[timerId]==true){
    return true;
  } else {
    return false
  }
}

void setDoorTimer(timerId){
  timerTime[timerId] = millis();
}

bool checkDoorTimer(timerId, seconds){
  if((millis()-timerTime[timerId]) > (seconds*1000)){
    return true;
  } else {
    return false;
  }
}

// autoLight door = 0
setDoor(0, "open");

void function autoLight(lightLevel, someoneRoom, isLightOn) {

  var lightLimit = 500;

  if(isLightOn){
    // luz encendida
    if((lightLevel-threshold) > lightLimit){

      if(checkDoorOpen(0)){
        setDoor(0, "closed");
        setDoorTimer(0);
        var startLight = lightLevel;
        turnOffLight();
      }

      if(checkDoorTimer(0, 5)){
        var endLight = lightLevel;
        thereshold = startLight - endLight;
        isLightOn = false;
        setDoor(0, "open");
      }
  
    }

  } else if(!isLightOn) {
    // luz apagada
    if((lightLevel+threshold) < lightLimit){

      if(checkDoorOpen(0)){
        setDoor(0, "closed");
        setDoorTimer(0);
        var startLight = lightLevel;
        turnOnLight();
      }

      if(checkDoorTimer(0, 5)){
        var endLight = lightLevel;
        thereshold = endLight - startLight;
        isLightOn = true;
        setDoor(0, "open");
      }
      
    }
  }
}



// =======================================================================================================
//
// SETUP
//
// =======================================================================================================

void setup(){
  
  // set pins 0-8 for digital output
  for (int i = 4; i <= 9; ++i) {
    pinMode(i, OUTPUT);
  }
  pinMode(2, INPUT);
  pinMode(3, INPUT);
  
  Serial.begin(9600);
  dht.begin();
  
  Ethernet.begin(mac, ip);
  webserver.begin();

  webserver.setDefaultCommand(&defaultCtrl);
  webserver.addCommand("json", &jsonCtrl);
  webserver.addCommand("form", &postCtrl);
  webserver.addCommand("ajaxPost", &ajaxPostCtrl);
}

// =======================================================================================================
//
// LOOP
//
// =======================================================================================================

void loop(){
  
  char buff[64];
  int len = 64;
  // process incoming connections one at a time forever
  webserver.processConnection(buff, &len);
  
  lightCtrl();
  
  // if you wanted to do other work based on a connecton, it would go here
}
