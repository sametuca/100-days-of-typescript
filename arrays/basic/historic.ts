
export const functionHistoric = () => {
const years: string[] = ["2023", "2024", "2025"];
const changedYears: string[] = [];
changedYears.push(...years.map(year => year));

function changeData()
{
    return years[0] = "Degisti";
}

changeData();

Object.keys(years).forEach((key, val) => {
    if(years[val] !== changedYears[val]) {
        console.log('şu değer değişti: ', years[val]);
        console.log('Eski değer: ', changedYears[val]);
    }
});

}
functionHistoric();
