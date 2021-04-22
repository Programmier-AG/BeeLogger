/*
  Connect Arduino WiFi to AskSensors
   Description:  This sketch connects the Arduino to AskSensors IoT Platform (https://asksensors.com) using an ESP8266 WiFi.
    Author: https://asksensors.com, 2018
    github: https://github.com/asksensors
*/


#include <SoftwareSerial.h>
#include <DHT.h>
#include <HX711_ADC.h>

// serial config
#define     RX    12
#define     TX    13
SoftwareSerial AT(RX, TX); //RX, TX
DHT dht(8, DHT11);

// TODO: change user config
String ssid = ""; // Wifi SSID
String password = ""; // Wifi Password
const unsigned int writeInterval = 60000; // write interval (in ms); max 60000! use multiplier for more
int wait_multiplier = 60; // wait time = writeInterval*wait_multiplier; leave interval at 60000 and put minutes here

String host = "";  // API host name
String port = "";      // port
String apiKey = ""; // API Key

int dat = 3; // put YOUR DATA PIN here
int clk = 2; // put YOUR CLOCK PIN here
float calValue = 42; // put YOUR CALIBRATION VALUE here, you get this by following the instructions in the calibration script
HX711_ADC scale(dat, clk); //define the scale

int AT_cmd_time;
boolean AT_cmd_result = false;

void setup() {
  Serial.begin(9600);
  dht.begin();

  scale.begin();
  Serial.println("wait till the scale is calibrated...this can take a moment...");
  //scale.start(5000);

  if (scale.getTareTimeoutFlag()) {
    Serial.println("Connection could not be established! Please chack your wireing...");
    while (true) {} // wait for Hardware reset
  }
  else {
    scale.setCalFactor(calValue); // set calibration value (float)
    Serial.println("SUCCESS! Scale initialized");
  }
  int i = 0;
  float weight;
  updateScale(10);

  // open serial
  Serial.println("******************************************************");
  Serial.println("* Program Start : Connect Arduino WiFi to AskSensors *");
  Serial.println("*      BeeLogger-rewrite; Wirtten by Sönke Klock     *");
  Serial.println("******************************************************");
  AT.begin(9600);
  Serial.println("Initiate AT commands with ESP8266 ");
  sendATcmd("AT", 5, "OK");
  //sendATcmd("AT+RST", 10, "OK");
  delay(5000);
  sendATcmd("AT+CWMODE=1", 5, "OK");
  sendATcmd("AT+CIPMUX=0", 10, "OK");

  Serial.print("Connecting to WiFi:");
  Serial.println(ssid);
  sendATcmd("AT+CWJAP=\"" + ssid + "\",\"" + password + "\"", 20, "OK");

  Serial.println("--------------- Setup Finished ---------------\n");
}

void loop() {
  int j;
  int i;
  float weight = updateScale(5);
  int t = dht.readTemperature();
  int h = dht.readHumidity();

  Serial.print("Temp: ");
  Serial.println(t);
  Serial.print("Humid: ");
  Serial.println(h);
  Serial.print("Gewicht:");
  Serial.println(weight);

  // Create the URL for the request
  String url = "GET /api/data/insert";
  url += "?token=" + apiKey;
  url += "&w=" + String(weight);
  url += "&h=" + String(h);
  url += "&t=" + String(t);
  //url += " HTTP/1.1";
  Serial.println("********** Open TCP connection ");
  //sendATcmd("AT+RST", 50, "WIFI GOT IP");
  sendATcmd("AT+CIFSR", 10, "OK");
  delay(3000);
  sendATcmd("AT+CIPSTART=\"TCP\",\"" + host + "\"," + port + "", 80, "OK");
  sendATcmd("AT+CIPSEND=" + String(url.length() + 4), 10, ">");

  Serial.print("********** requesting URL: ");
  Serial.println(url);
  AT.println(url);
  delay(2000);
  sendATcmd("AT+CIPCLOSE", 10, "OK");
  //sendATcmd("AT+CIPCLOSE", 10, "OK");

  Serial.println("********** Close TCP Connection ");

  Serial.println("Waiting for " + String(writeInterval) + " miliseconds");

  for (i = 0; i < wait_multiplier; i++) {
    Serial.print("Remaining times: ");
    Serial.println(wait_multiplier - i);
    delay(writeInterval);   // delay
  }
  Serial.println("\n\n------------------------------------------------------------------------");
}



// sendATcmd
void sendATcmd(String AT_cmd, int AT_cmd_maxTime, char readReplay[]) {
  Serial.print("AT command:");
  Serial.println(AT_cmd);

  while (AT_cmd_time < (AT_cmd_maxTime)) {
    AT.println(AT_cmd);
    if (AT.find(readReplay)) {
      AT_cmd_result = true;
      break;
    }

    AT_cmd_time++;
  }
  Serial.print("...Result:");
  if (AT_cmd_result == true) {
    Serial.println("DONE");
    AT_cmd_time = 0;
  }

  if (AT_cmd_result == false) {
    Serial.println("FAILED");
    AT_cmd_time = 0;
  }

  AT_cmd_result = false;
}

float updateScale(int thre) {
  int i = 0;
  float weight = 1;
  float old = 0;
  Serial.println("Updating the scale...");

  while (i < thre) {
    old = weight;
    scale.update();
    weight = scale.getData() / 1000;
    weight -= 205.69;

    if (old - 0.01 < weight && old + 0.01 > weight) {
      i ++;
    } else {
      i = 0;
    }
    delay(50);
    Serial.println(String(weight)  + "  " + String(old) + "        " + String(i));
  }
  Serial.println("Finished");
  if (weight < 0) {
    weight = 0;
  }
  return weight;
}
