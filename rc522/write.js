"use strict";
const Mfrc522 = require("mfrc522-rpi");
const SoftSPI = require("rpi-softspi");

//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

const softSPI = new SoftSPI({
    clock: 23, // pin number of SCLK
    mosi: 19, // pin number of MOSI
    miso: 21, // pin number of MISO
    client: 24 // pin number of CS
});

// GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
// I believe that channing pattern is better for configuring pins which are optional methods to use.
const mfrc522 = new Mfrc522(softSPI).setResetPin(22);

setInterval(function () {
    //# reset card
    mfrc522.reset();

    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        console.log("No Card");
        return;
    }
    console.log("Card detected, CardType: " + response.bitSize);

    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        console.log("UID Scan Error");
        return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    console.log(
        "Card read UID: %s %s %s %s",
        uid[0].toString(16),
        uid[1].toString(16),
        uid[2].toString(16),
        uid[3].toString(16)
    );

    //# Select the scanned card
    const memoryCapacity = mfrc522.selectCard(uid);
    console.log("Card Memory Capacity: " + memoryCapacity);

    //# This is the default key for authentication
    const key = [0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

    //# Authenticate on Block 8 with key and uid
    if (!mfrc522.authenticate(8, key, uid)) {
        console.log("Authentication Error");
        return;
    }


    const encoder = new TextEncoder();
    //# Variable for the data to write
    let data = encoder.encode("Hallo Welt! Villt bin ich nun viel zu lange!");
    // [
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff,
    //     0xff
    // ];

    console.log("Block 8 looked like this:");
    console.log(mfrc522.getDataForBlock(8));

    console.log("Block 8 will be filled with 0xFF:");
    mfrc522.writeDataToBlock(8, data);

    console.log("Now Block 8 looks like this:");
    console.log(mfrc522.getDataForBlock(8));

    // data = [
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00,
    //     0x00
    // ];

    // console.log("Now we fill it with 16 x 0");
    // mfrc522.writeDataToBlock(8, data);

    // console.log("It is now empty:");
    // console.log(mfrc522.getDataForBlock(8));

    mfrc522.stopCrypto();

    console.log("finished successfully!");
}, 500);