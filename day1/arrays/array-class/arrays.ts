export const Arrays = () => {

    class NumberArray {
        items: number[] = [1,2,3,4,5];
        getItems(): number[] {
            return this.items;
        }
    }

    let arr1 = new NumberArray();
    console.log('Orijinal Dizi: ', arr1.getItems());

    //Splice: Dizi kesme
    let arr2 = new NumberArray();
    let spliceArray = arr2.getItems().splice(2,5);
    console.log('Splice çalıştı: ', spliceArray);

    // Slice Örneği: Dizi dilimleme
    let arr3 = new NumberArray();
    let sliceArray =  arr3.getItems().slice(1,4);
    console.log('Slice çalıştı', sliceArray);

    // Concat Örneği: Dizileri birleştirme
    let arr4 = new NumberArray();
    let concatArray = arr4.getItems().concat([6,7,8]);
    console.log('Concat çalıştı', concatArray);

    // Map Örneği - Map: Dizi elemanlarını dönüştürmek için kullanılır
    let arr5 = new NumberArray();
    let mapArray = arr5.getItems().map(item => item * 2);
    console.log('Map çalıştı', mapArray);

    // Filter Örneği - Filter: Belirli bir koşulu sağlayan elemanları seçmek için kullanılır
    let arr6 = new NumberArray();
    let filterArray = arr6.getItems().filter(item => item > 2);
    console.log('Filter çalıştı', filterArray);

    // Reduce Örneği - Reduce: Dizi elemanlarını bir değere indirgemek için kullanılır
    let arr7 = new NumberArray();
    let reduceValue = arr7.getItems().reduce((acc, item) => acc + item, 0);
    console.log('Reduce çalıştı', reduceValue);

    // Find Örneği - Find: Belirli bir koşulu sağlayan ilk elemanı bulmak için kullanılır
    let arr8 = new NumberArray();
    let findValue = arr8.getItems().find(item => item > 3);
    console.log('Find çalıştı', findValue);

    // Sort Örneği - Sort: Dizi elemanlarını sıralamak için kullanılır
    let arr9 = new NumberArray();
    let sortArray = arr9.getItems().sort((a, b) => b - a);
    console.log('Sort çalıştı', sortArray);

    // ForEach Örneği - ForEach: Dizi elemanları üzerinde döngü yapmak için kullanılır
    let arr10 = new NumberArray();
    console.log('ForEach çalıştı:');
    arr10.getItems().forEach(item => console.log(item));

    // Includes Örneği - Includes: Bir elemanın dizide olup olmadığını kontrol etmek için kullanılır
    let arr11 = new NumberArray();
    let includesValue = arr11.getItems().includes(3);
    console.log('Includes çalıştı', includesValue);

    // Join Örneği - Join: Dizi elemanlarını birleştirerek tek bir string oluşturmak için kullanılır
    let arr12 = new NumberArray();
    let joinValue = arr12.getItems().join('-');
    console.log('Join çalıştı', joinValue);

    // IndexOf Örneği - IndexOf: Bir elemanın dizideki ilk indeksini bulmak için kullanılır
    let arr13 = new NumberArray();
    let indexOfValue = arr13.getItems().indexOf(4);
    console.log('IndexOf çalıştı', indexOfValue);

    // Pop Örneği - Pop: Dizinin son elemanını çıkarır ve döndürür
    let arr14 = new NumberArray();
    let popValue = arr14.getItems().pop();
    console.log('Pop çalıştı', popValue);

    // Push Örneği - Push: Dizinin sonuna yeni eleman ekler
    let arr15 = new NumberArray();
    let pushLength = arr15.getItems().push(6);
    console.log('Push çalıştı', pushLength);

    // Shift Örneği - Shift: Dizinin ilk elemanını çıkarır ve döndürür
    let arr16 = new NumberArray();
    let shiftValue = arr16.getItems().shift();
    console.log('Shift çalıştı', shiftValue);

    // Unshift Örneği - Unshift: Dizinin başına yeni eleman ekler
    let arr17 = new NumberArray();
    let unshiftLength = arr17.getItems().unshift(0);
    console.log('Unshift çalıştı', unshiftLength);

    // Reverse Örneği - Reverse: Dizi elemanlarının sırasını tersine çevirir
    let arr18 = new NumberArray();
    let reverseArray = arr18.getItems().reverse();
    console.log('Reverse çalıştı', reverseArray);

    // Fill Örneği - Fill: Dizi elemanlarını belirli bir değerle doldurur
    let arr19 = new NumberArray();
    let fillArray = arr19.getItems().fill(9);
    console.log('Fill çalıştı', fillArray);

    // Flat Örneği - Flat: Çok boyutlu dizileri tek boyuta indirger
    let arr20 = new NumberArray();
    let multiDimensionalArray: number[][] = [arr20.getItems(), [6,7,8]];
    let flatArray = multiDimensionalArray.flat();
    console.log('Flat çalıştı', flatArray);
}

Arrays();