@256 // BOOTSTRAPING SP/LCL/ARG (0/1/2) = 256/300/400
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
(Class1.set) // function Class1.set 0
@0
D=A
@ARG // push argument 0
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
@SP // pop static 0
M=M-1
A=M
D=M
@Class1.0
M=D
@ARG // push argument 1
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
@SP // pop static 1
M=M-1
A=M
D=M
@Class1.1
M=D
@0 // push constant 0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL // return
D=M
@R13
M=D
@R13
D=M
@5
D=D-A
A=D
D=M
@R14
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
@R14
A=M
0;JMP

(Class1.get) // function Class1.get 0
@0
D=A
@Class1.0 // push static 0
D=M
@SP
A=M
M=D
@SP
M=M+1
@Class1.1 // push static 1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP // sub
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1
@LCL // return
D=M
@R13
M=D
@R13
D=M
@5
D=D-A
A=D
D=M
@R14
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
@R14
A=M
0;JMP
(Class2.set) // function Class2.set 0
@0
D=A
@ARG // push argument 0
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
@SP // pop static 0
M=M-1
A=M
D=M
@Class2.0
M=D
@ARG // push argument 1
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
@SP // pop static 1
M=M-1
A=M
D=M
@Class2.1
M=D
@0 // push constant 0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL // return
D=M
@R13
M=D
@R13
D=M
@5
D=D-A
A=D
D=M
@R14
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
@R14
A=M
0;JMP

(Class2.get) // function Class2.get 0
@0
D=A
@Class2.0 // push static 0
D=M
@SP
A=M
M=D
@SP
M=M+1
@Class2.1 // push static 1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP // sub
M=M-1
A=M
D=M
@SP
M=M-1
A=M
M=M-D
@SP
M=M+1
@LCL // return
D=M
@R13
M=D
@R13
D=M
@5
D=D-A
A=D
D=M
@R14
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
@R14
A=M
0;JMP
(Sys.init) // function Sys.init 0
@0
D=A
@6 // push constant 6
D=A
@SP
A=M
M=D
@SP
M=M+1
@8 // push constant 8
D=A
@SP
A=M
M=D
@SP
M=M+1
@Class1.set$ret.0 // call Class1.set 2
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
@Class1.set
0;JMP
(Class1.set$ret.0)
@SP // pop temp 0
M=M-1
A=M
D=M
@5
M=D
@23 // push constant 23
D=A
@SP
A=M
M=D
@SP
M=M+1
@15 // push constant 15
D=A
@SP
A=M
M=D
@SP
M=M+1
@Class2.set$ret.1 // call Class2.set 2
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
@Class2.set
0;JMP
(Class2.set$ret.1)
@SP // pop temp 0
M=M-1
A=M
D=M
@5
M=D
@Class1.get$ret.2 // call Class1.get 0
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
@Class1.get
0;JMP
(Class1.get$ret.2)
@Class2.get$ret.3 // call Class2.get 0
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
@Class2.get
0;JMP
(Class2.get$ret.3)
(Sys.init$END) // label END
@Sys.init$END // goto END
0;JMP