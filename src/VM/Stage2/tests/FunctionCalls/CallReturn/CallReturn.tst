
load CallReturn.asm,
output-file CallReturn.out,
compare-to CallReturn.cmp,

set RAM[0] 256,

repeat 2500 {
	ticktock;
}

output-list RAM[0]%D1.6.1 RAM[261]%D1.6.1 RAM[262]%D1.6.1;
output;
