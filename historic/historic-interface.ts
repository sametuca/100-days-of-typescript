
export interface Historic {
    yearsString: string[];
    degisenString: string[];
    functionOrnekDegistir(): string;
}

export const functionHistoricWithInterface = () => {
const historicData: Historic = {
    yearsString: ["2023", "2024", "2025"],
    degisenString: [],
    functionOrnekDegistir: () => {
        return historicData.yearsString[0] = "Degisti";
    }
}

historicData.degisenString.push(...historicData.yearsString.map(year => year));
historicData.functionOrnekDegistir();

Object.keys(historicData.yearsString).forEach((key, val) => {
    if(historicData.yearsString[val] !== historicData.degisenString[val]) {
        console.log('şu değer değişti: ', historicData.yearsString[val]);
        console.log('Eski değer: ', historicData.degisenString[val]);
    }
});

}
functionHistoricWithInterface();
