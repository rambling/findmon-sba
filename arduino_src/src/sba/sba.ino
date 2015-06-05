// Adafruit_NeoMatrix example for single NeoPixel Shield.
// Scrolls 'Howdy' across the matrix in a portrait (vertical) orientation.

#include <Adafruit_GFX.h>
#include <Adafruit_NeoMatrix.h>
#include <Adafruit_NeoPixel.h>
#include <SPI.h>
#ifndef PSTR
 #define PSTR // Make Arduino Due happy
#endif

#define PIN 6

// MATRIX DECLARATION:
// Parameter 1 = width of NeoPixel matrix
// Parameter 2 = height of matrix
// Parameter 3 = pin number (most are valid)
// Parameter 4 = matrix layout flags, add together as needed:
//   NEO_MATRIX_TOP, NEO_MATRIX_BOTTOM, NEO_MATRIX_LEFT, NEO_MATRIX_RIGHT:
//     Position of the FIRST LED in the matrix; pick two, e.g.
//     NEO_MATRIX_TOP + NEO_MATRIX_LEFT for the top-left corner.
//   NEO_MATRIX_ROWS, NEO_MATRIX_COLUMNS: LEDs are arranged in horizontal
//     rows or in vertical columns, respectively; pick one or the other.
//   NEO_MATRIX_PROGRESSIVE, NEO_MATRIX_ZIGZAG: all rows/columns proceed
//     in the same order, or alternate lines reverse direction; pick one.
//   See example below for these values in action.
// Parameter 5 = pixel type flags, add together as needed:
//   NEO_KHZ800  800 KHz bitstream (most NeoPixel products w/WS2812 LEDs)
//   NEO_KHZ400  400 KHz (classic 'v1' (not v2) FLORA pixels, WS2811 drivers)
//   NEO_GRB     Pixels are wired for GRB bitstream (most NeoPixel products)
//   NEO_RGB     Pixels are wired for RGB bitstream (v1 FLORA pixels, not v2)


// Example for NeoPixel Shield.  In this application we'd like to use it
// as a 5x8 tall matrix, with the USB port positioned at the top of the
// Arduino.  When held that way, the first pixel is at the top right, and
// lines are arranged in columns, progressive order.  The shield uses
// 800 KHz (v2) pixels that expect GRB color data.
Adafruit_NeoMatrix matrix = Adafruit_NeoMatrix(32, 8, PIN,
  NEO_MATRIX_TOP     + NEO_MATRIX_LEFT +
  NEO_MATRIX_COLUMNS + NEO_MATRIX_ZIGZAG,
  NEO_GRB            + NEO_KHZ800);

const String TAG_MESSAGE = "[MESSAGE]";
const String TAG_NOTIFICATION = "[NOTIFICATION]";
const uint16_t colors[] = { matrix.Color(255, 0, 0), matrix.Color(0, 255, 0), matrix.Color(0, 0, 255) };
const String notifications[] = {
  "Tag me, get the 20\% coupon",
  "Today is a recycling day!",
  "Have a nice day."
};

int matrixWidth = matrix.width();
int notiIdx = 0;
int showMsgRepeat = 10;
int longMsgRepeat = 3;
String message = "";

void setup() {
  initMatix();
  initSerial();
}

void loop() {
  if (message.length() > 0 || existSerialInput()) {
    int repeat = 1;
    if (message.length() * 6 - 1 > 32) {
      repeat = longMsgRepeat;
    } else {
      repeat = showMsgRepeat;
    }

    displayText(message, repeat, colors[1]);
  } else {
    displayText(notifications[notiIdx++], 1, colors[2]);
    if (notiIdx > 1) {
      notiIdx = 0;
    }
  }
}

void initMatix() {
  matrix.begin();
  matrix.setTextWrap(false);
  matrix.setBrightness(40);
  matrix.setTextColor(colors[0]);
}

void displayText(String text, int repeat, uint16_t color) {

  //scrolling text
  int textPixelWidth = text.length() * 6 - 1;
  int count = 0;
  bool forceStop = false;

  for(int i = 0; i < repeat; i++) {

    if (textPixelWidth > matrixWidth) {
      for (int scrollIndex = matrixWidth; scrollIndex > -textPixelWidth; scrollIndex--) {
        matrix.fillScreen(0);
        matrix.setCursor(scrollIndex, 0);
        matrix.print(text);
        matrix.setTextColor(color);
        matrix.show();
        delay(50);

        if (existSerialInput()) {
          forceStop = true;
          break;
        }
      }

    } else {
      int x = (matrixWidth - textPixelWidth) / 2;
      matrix.fillScreen(0);
      matrix.setTextColor(color);
      matrix.show();
      delay(70);
      matrix.setCursor(x, 0);
      matrix.print(text);
      matrix.setTextColor(color);
      matrix.show();
      delay(150);
    }

    if (forceStop) {
      return;
    }
  }

  message = "";
}

void initSerial(){
  //Setup Serial Port with baud rate of 9600
  Serial.begin(9600);
}

bool existSerialInput() {
  bool exist = false;
  String input = "";

  while (Serial.available()) {
    char charRead = Serial.read();
    input.concat(charRead);
  }

  input.trim();

  if (input.length() > 0) {
    if (input.indexOf(TAG_MESSAGE) > -1) {
      input.replace(TAG_MESSAGE, "");
      exist = true;
      message = input;
    } else if (input.startsWith(TAG_NOTIFICATION)) {
      input.replace(TAG_NOTIFICATION, "");
    }
  }

  return exist;
}
