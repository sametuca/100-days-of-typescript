
// failingResponse adında bir tuple tanımlayın ve ilk elemanı string, ikinci elemanı number türünde olsun.
const failingResponse = ["Not Found", 404];

// failingResponse'ın ikinci elemanı 404 ise, ilk elemanı konsola yazdırın.
const passingResponse: [string, number] = ["{}", 200];


// passingResponse'ın ikinci elemanı 200 ise, ilk elemanı JSON olarak ayrıştırın ve konsola yazdırın.
if (passingResponse[1] === 200) {
  const localInfo = JSON.parse(passingResponse[0]);
  console.log(localInfo);
}

// StaffAccount adında bir tuple türü tanımlayın. İlk elemanı number, ikinci elemanı string, üçüncü elemanı string ve isteğe bağlı dördüncü elemanı string türünde olsun.
type StaffAccount = [number, string, string, string?];

// staff adında StaffAccount türünde elemanlar içeren bir dizi tanımlayın.
const staff: StaffAccount[] = [
  [0, "Adankwo", "adankwo.e@"],
  [1, "Kanokwan", "kanokwan.s@"],
  [2, "Aneurin", "aneurin.s@", "Supervisor"],
];

// PayStubs adında bir tuple türü tanımlayın. İlk elemanı StaffAccount türünde, geri kalan elemanları number türünde olsun.
type PayStubs = [StaffAccount, ...number[]];

// payStubs adında PayStubs türünde elemanlar içeren bir dizi tanımlayın.
const payStubs: PayStubs[] = [
  [staff[0], 250],
  [staff[1], 250, 260],
  [staff[0], 300, 300, 300],
];

// Her ay için toplam ödemeleri hesaplayın.
const monthOnePayments = payStubs[0][1] + payStubs[1][1] + payStubs[2][1];
const monthTwoPayments = payStubs[1][2] + payStubs[2][2];
const monthThreePayments = payStubs[2][2];

// calculatePayForEmployee adında bir fonksiyon bildirin. İlk parametresi number türünde id, geri kalan parametreleri number türünde değişken sayıda argüman alır ve number türünde değer döner.
declare function calculatePayForEmployee(id: number, ...args: [...number[]]): number;

// calculatePayForEmployee fonksiyonunu kullanarak belirli çalışanlar için ödemeleri hesaplayın.
calculatePayForEmployee(staff[0][0], payStubs[0][1]);
calculatePayForEmployee(staff[1][0], payStubs[1][1], payStubs[1][2]);

