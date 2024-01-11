// BOOTSTRAPING SP/LCL/ARG (0/1/2) = 256/300/400
@256
D=A
@0
M=D
@300
D=A
@1
M=D
@400
D=A
@2
M=D
@Sys.init
0;JMP
// function Main.fibonacci 0
(Main.fibonacci)
@0
D=A

// push argument 0
@ARG
D=M
@0
D=D+A
@R13
M=D
@R13
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// push constant 2
@2
D=A
@SP
A=M
M=D
@SP
M=M+1

// lt
@SP
M=M-1
A=M
D=M
@R13
M=D
@SP
M=M-1
A=M
D=M
@R13
A=M
D=D-A
@Main_JMP0_lt
D;JLT
@0
D=A
@SP
A=M
M=D
@Main_END1_lt
0;JMP
(Main_JMP0_lt)
@0
D=A
@SP
A=M
M=D-1
(Main_END1_lt)
@SP
M=M+1

// if-goto N_LT_2
@SP
M=M-1
A=M
D=M
@Main.fibonacci$N_LT_2
D;JNE

// goto N_GE_2
@Main.fibonacci$N_GE_2
0;JMP

// label N_LT_2
(Main.fibonacci$N_LT_2)

// push argument 0
@ARG
D=M
@0
D=D+A
@R13
M=D
@R13
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// return
@LCL
D=M
@R13
M=D
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@ARG
A=M
D=M+1
@SP
M=D
@R13
D=M
D=D-1
@THAT
M=D
D=D-1
@THIS
M=D
D=D-1
@ARG
M=D
D=D-1
@LCL
M=D
D=D-1
A=D
0;JMP

// label N_GE_2
(Main.fibonacci$N_GE_2)

// push argument 0
@ARG
D=M
@0
D=D+A
@R13
M=D
@R13
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// push constant 2
@2
D=A
@SP
A=M
M=D
@SP
M=M+1

// sub
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1

// call Main.fibonacci 1
@Main.fibonacci$ret.0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=A
@5
D=D-A
@1
D=D-A
@ARG
M=D
@SP
D=A
@LCL
M=D
@Main.fibonacci
0;JMP
(Main.fibonacci$ret.0)

// push argument 0
@ARG
D=M
@0
D=D+A
@R13
M=D
@R13
A=M
D=M
@SP
A=M
M=D
@SP
M=M+1

// push constant 1
@1
D=A
@SP
A=M
M=D
@SP
M=M+1

// sub
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1

// call Main.fibonacci 1
@Main.fibonacci$ret.1
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=A
@5
D=D-A
@1
D=D-A
@ARG
M=D
@SP
D=A
@LCL
M=D
@Main.fibonacci
0;JMP
(Main.fibonacci$ret.1)

// add
@SP
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=D+M
@SP
M=M+1

// return
@LCL
D=M
@R13
M=D
@SP
M=M-1
A=M
D=M
@ARG
A=M
M=D
@ARG
A=M
D=M+1
@SP
M=D
@R13
D=M
D=D-1
@THAT
M=D
D=D-1
@THIS
M=D
D=D-1
@ARG
M=D
D=D-1
@LCL
M=D
D=D-1
A=D
0;JMP
// function Sys.init 0
(Sys.init)
@0
D=A

// push constant 4
@4
D=A
@SP
A=M
M=D
@SP
M=M+1

// call Main.fibonacci 1
@Main.fibonacci$ret.0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
D=A
@5
D=D-A
@1
D=D-A
@ARG
M=D
@SP
D=A
@LCL
M=D
@Main.fibonacci
0;JMP
(Main.fibonacci$ret.0)

// label END
(Sys.init$END)

// goto END
@Sys.init$END
0;JMP