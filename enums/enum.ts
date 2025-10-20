// Enum'lar, TypeScript'te JavaScript'e eklenen bir özelliktir
// ve adlandırılmış sabit kümelerini yönetmeyi kolaylaştırır.

// Varsayılan olarak bir enum sayı tabanlıdır, sıfırdan başlar,
// ve her seçenek birer birer artırılarak atanır. Bu, değerin
// önemli olmadığı durumlarda kullanışlıdır.

enum CompassDirection {
  North,    // 0
  East,     // 1
  South,    // 2
  West,     // 3
}

// Bir enum seçeneğine değer atayarak, o değeri belirlersiniz;
// artışlar o değerden devam eder:

enum StatusCodes {
  OK = 200,              // 200
  BadRequest = 400,      // 400
  Unauthorized,          // 401 (400'den devam eder)
  PaymentRequired,       // 402
  Forbidden,             // 403
  NotFound,              // 404
}

// Bir enum'a EnumAdı.Değer şeklinde erişirsiniz

const startingDirection = CompassDirection.East;  // 1
const currentStatus = StatusCodes.OK;             // 200

// Enum'lar hem anahtardan değere, hem de değerden anahtara
// çift yönlü veri erişimini destekler.

const okNumber = StatusCodes.OK;           // 200
const okNumberIndex = StatusCodes["OK"];   // 200
const stringBadRequest = StatusCodes[400]; // "BadRequest"

// Enum'lar farklı türlerde olabilir, string türü yaygındır.
// String kullanmak hata ayıklamayı kolaylaştırır, çünkü
// çalışma zamanındaki değer sayıya bakmanızı gerektirmez.

enum GamePadInput {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// JavaScript çalışma zamanınızda nesne sayısını azaltmak
// isterseniz, const enum oluşturabilirsiniz.

// Bir const enum'un değeri, çalışma zamanında bir nesne
// üzerinden aranmak yerine, TypeScript tarafından kodunuzun
// transpile edilmesi sırasında değiştirilerek yerine konur.

const enum MouseAction {
  MouseDown,         // 0
  MouseUpOutside,    // 1
  MouseUpInside,     // 2
}

const handleMouseAction = (action: MouseAction) => {
  switch (action) {
    case MouseAction.MouseDown:
      console.log("Mouse Down");
      break;
  }
};

// Transpile edilmiş JavaScript'e bakarsanız, diğer enum'ların
// nasıl nesne ve fonksiyon olarak var olduğunu görürsünüz,
// ancak MouseAction orada yoktur.

// Bu durum, handleMouseAction içindeki switch ifadesinde
// MouseAction.MouseDown kontrolü için de geçerlidir.