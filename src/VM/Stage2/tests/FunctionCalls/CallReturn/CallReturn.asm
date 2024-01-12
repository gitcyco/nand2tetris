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
@0
D=A
@SP
A=M
M=D
@SP
M=M+1
@Sys.init$ret.0
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
D=M
@5
D=D-A
@0
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.init
0;JMP
(Sys.init$ret.0)
// function ClassA.main 0
(ClassA.main)
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

// pop static 0
@SP
M=M-1
A=M
D=M
@ClassA.0
M=D

// push argument 1
@ARG
D=M
@1
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

// pop static 1
@SP
M=M-1
A=M
D=M
@ClassA.1
M=D

// push constant 0
@0
D=A
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
D=A+1
@SP
M=D
@R13
A=M
A=A-1
D=M
@THAT
M=D
@R13
A=M
A=A-1
A=A-1
D=M
@THIS
M=D
@R13
A=M
A=A-1
A=A-1
A=A-1
D=M
@ARG
M=D
@R13
A=M
A=A-1
A=A-1
A=A-1
A=A-1
D=M
@LCL
M=D
@R13
A=M
A=A-1
A=A-1
A=A-1
A=A-1
A=A-1
A=M
0;JMP
// function Sys.init 0
(Sys.init)
@0
D=A

// push constant 6
@6
D=A
@SP
A=M
M=D
@SP
M=M+1

// push constant 8
@8
D=A
@SP
A=M
M=D
@SP
M=M+1

// call ClassA.main 2
@ClassA.main$ret.0
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
D=M
@5
D=D-A
@2
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@ClassA.main
0;JMP
(ClassA.main$ret.0)

// pop temp 0
@SP
M=M-1
A=M
D=M
@5
M=D

// push constant 6
@6
D=A
@SP
A=M
M=D
@SP
M=M+1

// push constant 8
@8
D=A
@SP
A=M
M=D
@SP
M=M+1

// call ClassA.main 2
@ClassA.main$ret.1
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
D=M
@5
D=D-A
@2
D=D-A
@ARG
M=D
@SP
D=M
@LCL
M=D
@ClassA.main
0;JMP
(ClassA.main$ret.1)

// pop temp 0
@SP
M=M-1
A=M
D=M
@5
M=D

// label END
(Sys.init$END)

// goto END
@Sys.init$END
0;JMP