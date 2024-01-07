load SimpleTest.asm,
output-file SimpleTest.out,
compare-to SimpleTest.cmp,

set RAM[0] 256,   // stack pointer
set RAM[1] 300,   // base address of the local segment
set RAM[2] 400,   // base address of the argument segment
set RAM[3] 3000,  // base address of the this segment
set RAM[4] 3010,  // base address of the that segment

repeat 600 {      // enough cycles to complete the execution
  ticktock;
}

// | RAM[0] | RAM[256] | RAM[257] | RAM[258] | RAM[259] | RAM[260] |
// | 266 | -1 | 0 | 0 | 0 | -1 |
// | RAM[261] | RAM[262] | RAM[263] | RAM[264] | RAM[265] |
// | 0 | -1 | 0 | 0 | -91 |

// Outputs the value at the stack's base and some values from the tested memory segments
output-list RAM[0]%D1.6.1 RAM[256]%D1.6.1 RAM[257]%D1.6.1 
            RAM[258]%D1.6.1 RAM[259]%D1.6.1 RAM[260]%D1.6.1
            RAM[261]%D1.6.1 RAM[262]%D1.6.1 RAM[263]%D1.6.1 RAM[264]%D1.6.1 RAM[265]%D1.6.1;
output;
