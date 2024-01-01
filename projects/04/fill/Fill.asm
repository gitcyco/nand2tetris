// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen
// by writing 'black' in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen by writing
// 'white' in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Implement:
// (TOP)
// for(let i = 0; i < n; i++) {
//   fillScreen(SCREEN+i, 0)
// }
// while(KEYBOARD == 0) {
//   nop
// }
// for(let i = 0; i < n; i++) {
//   fillScreen(SCREEN+i, -1)
// }
// while(KEYBOARD != 0) {
//   nop
// }
// jmp TOP


(TOP)
  @SCREEN   // Load address of SCREEN into A register
  D=A   // Set D register to value of A
  @R0   // Load address of R0
  M=D   // Store our current SCREEN pointer in R0

  @0    // Store 0 in A register
  D=A   // Set D register to value in A
  @i    // Load address of i
  M=D   // Zero out i just in case
  
  @8192 // Load immediate value 8192, the size in words of our display mem map
  D=A   // Set D register to value of A
  @n    // Load address of n
  M=D   // Set n to the value in D

(CLEAR)
  @i    // Load address of i
  D=M   // Set D register to value of i
  @n    // Load address of n
  D=D-M // Set D to D - M
  @DONE_CLEAR  // Load address of DONE_CLEAR label
  D;JEQ // If D == 0 jmp to DONE_CLEAR

  @R0   // Set A to address of R0 (retrieve our current pointer to SCREEN)
  D=M   // Set D register to value in R0
  A=D   // Set A to value in D (set A to our pointer to SCREEN)
  M=0   // Set the address in A to 0 (clear the pixel)
  @R0   // Set A to address of R0 (retrieve our current pointer to SCREEN)
  D=M   // Set D register to value in R0
  D=D+1 // Add 1 to our screen pointer in D
  M=D   // Save our pointer back to R0
  @i    // Load address of i
  D=M   // Set D register to value of i
  D=D+1 // Increment value in D
  M=D   // Store value in D back into i
  @CLEAR
  0;JMP

(DONE_CLEAR)
// Loop until keyboard value is indicated in KBD register
  @KBD  // Load address of KBD mem map (keyboard pointer)
  D=M   // Set D register to value in KBD
  @DONE_CLEAR // Load DONE_CLEAR address into A
  D;JEQ // Loop to DONE_CLEAR as long as KBD is 0

// Here we repeat all of the above in CLEAR except we set the value to -1 (all black pixels)
  @SCREEN   // Load address of SCREEN into A register
  D=A   // Set D register to value of A
  @R0   // Load address of R0
  M=D   // Store our current SCREEN pointer in R0

  @0    // Store 0 in A register
  D=A   // Set D register to value in A
  @i    // Load address of i
  M=D   // Zero out i just in case
  
  @8192 // Load immediate value 8192, the size in words of our display mem map
  D=A   // Set D register to value of A
  @n    // Load address of n
  M=D   // Set n to the value in D

(PIXEL_ON)
  @i    // Load address of i
  D=M   // Set D register to value of i
  @n    // Load address of n
  D=D-M // Set D to D - M
  @DONE_PIXEL_ON  // Load address of DONE_PIXEL_ON label
  D;JEQ // If D == 0 jmp to DONE_PIXEL_ON

  @R0   // Set A to address of R0 (retrieve our current pointer to SCREEN)
  D=M   // Set D register to value in R0
  A=D   // Set A to value in D (set A to our pointer to SCREEN)
  M=-1  // Set the address in A to -1 (set all the pixels in this word)
  @R0   // Set A to address of R0 (retrieve our current pointer to SCREEN)
  D=M   // Set D register to value in R0
  D=D+1 // Add 1 to our screen pointer in D
  M=D   // Save our pointer back to R0
  @i    // Load address of i
  D=M   // Set D register to value of i
  D=D+1 // Increment value in D
  M=D   // Store value in D back into i
  @PIXEL_ON
  0;JMP

(DONE_PIXEL_ON)
// Loop until keyboard value is indicated in KBD register
  @KBD  // Load address of KBD mem map (keyboard pointer)
  D=M   // Set D register to value in KBD
  @DONE_PIXEL_ON // Load DONE_PIXEL_ON address into A
  D;JGT // Loop to DONE_PIXEL_ON as long as KBD is NOT 0

  @TOP
  0;JMP

// This just a debugging safeguard for fall through, it should never happen
(END)
  @END    // Infinite loop
  0;JMP