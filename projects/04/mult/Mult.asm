// Multiply two numbers

// Spec:
// Multiplication: in the Hack computer, the top 16 RAM words (RAM[0]...RAM[15]) are also referred to as R0...R15. 
// With this terminology in mind, this program computes the value R0*R1 and stores the result in R2.
// The program assumes that R0>=0, R1>=0, and R0*R1<32768.

// for(i = 0; i < n; i++) {
//   R2 = R2 + R0
// }
// Where: n == R1

(TOP)
  @0    // Load 0 into A register
  D=A   // Set D register to value of A
  @R2   // Load address of R2
  M=D   // Zero out R2 just in case

  @0    // Load 0 into A register
  D=A   // Set D register to value of A
  @i    // Load address of i
  M=D   // Zero out i just in case

  @R1   // Load address of R1
  D=M   // Set D register to value at R1
  @n    // Initialize variable n
  M=D   // Set n to value of D
  @END  // Load address of END label
  D;JEQ // Quit if input argument R1 == 0

  @R0   // Load address of R0
  D=M   // Set D register to value at R0
  @END  // Load address of END label
  D;JEQ // Quit if input argument R0 == 0

(LOOP)
  @i    // Load address of i
  D=M   // Set D register to value of i
  @n    // Load address of n
  D=D-M // Set D to D - M
  @END  // Load address of END label
  D;JEQ // If D == 0 jmp to END

  @R0   // Load address of R0
  D=M   // Set D register to value of R0
  @R2   // Load address of R2
  D=D+M // Add D to value at R2
  M=D   // Store result to R2

  @i    // Load address of i
  D=M   // Set D register to value of i
  D=D+1 // Add 1 to D register
  M=D   // Write D register value to i
  @LOOP // Load address of LOOP label
  0;JMP // jmp to LOOP

(END)
  @END    // Infinite loop
  0;JMP