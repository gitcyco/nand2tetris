
// function Main.fibonacci 0
(Main.Main.fibonacci)
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
@Main.Main.fibonacci$N_LT_2
D;JNE

// goto N_GE_2
@Main.Main.fibonacci$N_GE_2
0;JMP

// label N_LT_2
(Main.Main.fibonacci$N_LT_2)

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

// label N_GE_2
(Main.Main.fibonacci$N_GE_2)

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
// function Sys.init 0
(Sys.Sys.init)
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

// label END
(Sys.Sys.init$END)

// goto END
@Sys.Sys.init$END
0;JMP