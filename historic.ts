const yearsString: string[] = ["2023", "2024", "2025"];
const degisenString: string[] = [];

degisenString.push(...yearsString.map(year => year));

function functionOrnekDegistir()
{
    return yearsString[0] = "Degisti";
}

functionOrnekDegistir();

Object.keys(yearsString).forEach((key, val) => {
    if(yearsString[val] !== degisenString[val]) {
        console.log('şu değer değişti: ', yearsString[val]);
        console.log('Eski değer: ', degisenString[val]);
    }
});
