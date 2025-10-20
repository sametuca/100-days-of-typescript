
export interface Historic<T = string, TResult = void> {
    years: T[];
    changedYears: T[];
    changeData(): TResult;
}

export const functionHistoricWithInterface = () => {

const historicData: Historic<string, void> = {
    years: ["2023", "2024", "2025"],
    changedYears: [],
    changeData: (): void => {
        historicData.years[0] = "Degisti";
    }
}

historicData.changedYears.push(...historicData.years.map(year => year));
historicData.changeData();

Object.keys(historicData.years).forEach((key, val) => {
    if(historicData.years[val] !== historicData.changedYears[val]) {
        console.log('şu değer değişti: ', historicData.years[val]);
        console.log('Eski değer: ', historicData.changedYears[val]);
    }
});

}
functionHistoricWithInterface();
