#include <Adafruit_Fingerprint.h>

#if (defined(__AVR__) || defined(ESP8266)) && !defined(__AVR_ATmega2560__)
#include <SoftwareSerial.h>
SoftwareSerial mySerial(2, 3);
#else
#define mySerial Serial1
#endif

Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

#define LEDPIN 13

// Ultrasonic sensor pins
const int triggerPin = 9;
const int echoPin = 8;

// pins for motor medicine 1
const int motorPin1 = 4;
const int motorPin2 = 5;

// pins for motor medicine 2
const int motorPin12 = 10; 
const int motorPin22 = 11; 

// all three pwm pins
const int pwmPin = 6; 
const int pwmPin2 = 7;
const int pwmPinLid = 12; 

// control which medication gets dispensed
int medState;

// check if user is doctor
bool isDoctor = false;

// check to see if lid is open
bool isOpen = false;

// threshold for pressure sensor to open and close lid
const int threshold = 200;

// pin for pressure sensor
const int fsrPin = A0;

// pins for the lid motor 
const int motorLidPin1 = 1;
const int motorLidPin2 = 2;

// object to store user data on sensor
struct User {
  uint8_t id;
  String name;
};

User user; 
uint8_t id;

// variable to control spinning of motors 
bool allowMotion = false; // Flag to control motion detection

void setup() {
  pinMode(LEDPIN, OUTPUT);
  pinMode(triggerPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(motorPin1, OUTPUT);
  pinMode(motorPin2, OUTPUT);
  pinMode(pwmPin, OUTPUT);

  pinMode(motorPin12, OUTPUT);
  pinMode(motorPin22, OUTPUT);
  pinMode(pwmPin2, OUTPUT);
  
  pinMode(motorLidPin1, OUTPUT);
  pinMode(motorLidPin2, OUTPUT);
  pinMode(pwmPinLid, OUTPUT);

  Serial.begin(9600);
  while (!Serial); 

  Serial.println("\n\nAdafruit Fingerprint sensor enrollment and identification");

  finger.begin(57600);

  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }


  // function to clear and wipe prints 
  // clearAllPrints();
}

void loop() {
  if (Serial.available()) {
    String command = Serial.readStringUntil('\n');
    command.trim();

  // a bunch of states to control what happens depending on the port.write(...) from the node js server
    if (command == "enroll") {
      uint8_t id = Serial.parseInt();
      enrollFingerprint(id);
    } else if (command == "check") {
        Serial.println("Starting fingerprint scan...");
        checkFingerprint();
        // if the user is a doctor we allow the openLid function to be called
        if(isDoctor){
          openLid();
        }
    }else if(command == "logout"){
      digitalWrite(LEDPIN, LOW);
      allowMotion = false;
    } else if (command == ("allowMotionAdvil")) {
        digitalWrite(LEDPIN, HIGH);
        medState = 0; 
        allowMotion = true;
    } else if (command == ("allowMotionTylenol")) {
        digitalWrite(LEDPIN, HIGH);
        medState = 1; 
        allowMotion = true;
    } else if (command == "lightoff") {
      digitalWrite(LEDPIN, LOW);
      allowMotion = false;
    }
  }

  if (allowMotion) {
    detectProximity();
  }

  
}


void enrollFingerprint(uint8_t id) {
  Serial.print("Enrolling fingerprint for ID: "); Serial.println(id);

  while (!getFingerprintEnroll(id)) {
    Serial.println("Failed to enroll, retrying...");
  }

  Serial.println("Enrollment complete");
  Serial.println("enrollment complete"); // Send success message to server
}


bool checkFingerprint() {
  Serial.println("Waiting for fingerprint input...");
  uint8_t p = -1;
  unsigned long startTime = millis(); // Start time for LED timeout
  bool ledOn = false; // Flag to track LED state

  while (millis() - startTime < 10000) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }

    if (p == FINGERPRINT_OK) {
      p = finger.image2Tz();
      if (p != FINGERPRINT_OK) {
        Serial.println("Failed to convert image");
        return false;
      }

      p = finger.fingerSearch();
      if (p != FINGERPRINT_OK) {
        Serial.println("Fingerprint not found");
        return false;
      }

      Serial.print("Found ID #"); Serial.print(finger.fingerID); 
      Serial.print(" with confidence of "); Serial.println(finger.confidence);
      Serial.println("match");

      return true;
    }

    delay(100); // Small delay to avoid spamming the sensor
  }

  return false;
}

uint8_t getFingerprintEnroll(uint8_t id) {
  int p = finger.getImage();
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image taken");
      break;
    case FINGERPRINT_NOFINGER:
      Serial.println("No finger detected");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_IMAGEFAIL:
      Serial.println("Imaging error");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  }

  // OK success!

  p = finger.image2Tz(1);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  }

  Serial.println("Remove finger");
  delay(2000);
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
    delay(100);
  }
  Serial.print("ID "); Serial.println(id);
  p = -1;
  Serial.println("Place same finger again");

  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
      case FINGERPRINT_OK:
        Serial.println("Image taken");
        break;
      case FINGERPRINT_NOFINGER:
        Serial.print(".");
        break;
      case FINGERPRINT_PACKETRECIEVEERR:
        Serial.println("Communication error");
        break;
      case FINGERPRINT_IMAGEFAIL:
        Serial.println("Imaging error");
        break;
      default:
        Serial.println("Unknown error");
        break;
    }
    delay(100);
  }

  p = finger.image2Tz(2);
  switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image converted");
      break;
    case FINGERPRINT_IMAGEMESS:
      Serial.println("Image too messy");
      return p;
    case FINGERPRINT_PACKETRECIEVEERR:
      Serial.println("Communication error");
      return p;
    case FINGERPRINT_FEATUREFAIL:
      Serial.println("Could not find fingerprint features");
      return p;
    case FINGERPRINT_INVALIDIMAGE:
      Serial.println("Could not find fingerprint features");
      return p;
    default:
      Serial.println("Unknown error");
      return p;
  }

  // OK converted!
  Serial.print("Creating model for #");  Serial.println(id);

  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_ENROLLMISMATCH) {
    Serial.println("Fingerprints did not match");
    return p;
  } else {
    Serial.println("Unknown error");
    return p;
  }

  Serial.print("ID "); Serial.println(id);
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
  } else if (p == FINGERPRINT_PACKETRECIEVEERR) {
    Serial.println("Communication error");
    return p;
  } else if (p == FINGERPRINT_BADLOCATION) {
    Serial.println("Could not store in that location");
    return p;
  } else if (p == FINGERPRINT_FLASHERR) {
    Serial.println("Error writing to flash");
    return p;
  } else {
    Serial.println("Unknown error");
    return p;
  }

  return true;
}

void detectProximity() {
  long duration;
  int distance;

  digitalWrite(triggerPin, LOW);
  delayMicroseconds(2);

  // Set the trigger pin high for 10 microseconds
  digitalWrite(triggerPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerPin, LOW);

  // Read the echo pin and calculate the distance
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2; // Convert to centimeters

  // Send distance to serial port
  Serial.print("Distance: ");
  Serial.println(distance);

  if (distance < 6) { 
    Serial.println("Object detected within 6 cm");
    Serial.println("objectDetected");
    digitalWrite(LEDPIN, LOW);
    if(medState == 0){
      startMotorOne();
    }else if(medState == 1){
      startMotorTwo();
    }
    allowMotion = false;
  }

  delay(100); // Delay between checks
}

// this is one motor starting and stoping 
void startMotorOne(){
  digitalWrite(motorPin1, HIGH);
  digitalWrite(motorPin2, LOW);
  analogWrite(pwmPin, 80); 
  delay(1100);
  analogWrite(pwmPin, 0);
  delay(500);
}

// this is the other motor, the reason they are different is due to PWM frequency issues with DC Motor drivers, this took forever to understand why one motor
// was spinning and the other was not...LOL
void startMotorTwo(){
  digitalWrite(motorPin12, HIGH);
  digitalWrite(motorPin22, LOW);
  analogWrite(pwmPin2, 130); 
  delay(200);
  analogWrite(pwmPin2, 0);
  delay(500);
  analogWrite(pwmPin2, 130); 
  delay(80);
  analogWrite(pwmPin2, 0);
  delay(80);
  analogWrite(pwmPin2, 130); 
  delay(80);
  analogWrite(pwmPin2, 0);
  delay(80);
  analogWrite(pwmPin2, 130); 
  delay(80);
  analogWrite(pwmPin2, 0);
  delay(200);
  analogWrite(pwmPin2, 130); 
  delay(80);
  analogWrite(pwmPin2, 0);
  delay(200);
  analogWrite(pwmPin2, 130); 
  delay(80);
  analogWrite(pwmPin2, 0);
  delay(200);

  analogWrite(pwmPin2, 0);
  delay(2000); 
}

voidLid(){
  isOpen = false;
  
  // level is the number recived from the presure sensor value
  if(isOpen == false && level > threshold){
    openLidCall();
  }else if(isOpen == true && level > threshold){
    closeLidCall();
  }

  delay(50);

}

void openLidCall(){
  digitalWrite(motorPinLid1, HIGH);
  digitalWrite(motorPinLid2, LOW);

  analogWrite(pwmPinLid, 105);
  delay(60);

  digitalWrite(motorPinLid1, LOW);
  digitalWrite(motorPinLid2, LOW);

  isOpen = true;
}

void openLidCall(){
  digitalWrite(motorPinLid1, LOW);
  digitalWrite(motorPinLid2, HIGH);

  analogWrite(pwmPinLid, 105);
  delay(60);

  digitalWrite(motorPinLid1, LOW);
  digitalWrite(motorPinLid2, LOW);

  isOpen = false;
}


// void clearAllPrints() {
//   Serial.println("Clearing all enrolled prints:");

//   for (uint8_t id = 0; id <= 240; id++) {
//     Serial.print("Deleting ID #"); Serial.println(id);
//     if (finger.deleteModel(id)) {
//       Serial.print("Deleted ID #"); Serial.println(id);
//     } else {
//       Serial.print("Failed to delete ID #"); Serial.println(id);
//     }
//   }
// }
