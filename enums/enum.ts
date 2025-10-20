
// Türkçesi : // TypeScript'te enum'lar, ilişkili sabit değerler kümesini tanımlamanıza olanak tanır.

// Varsayılan olarak, enum değerleri 0'dan başlayarak artan sayılar olarak atanır.
enum CompassDirection {
  North,
  East,
  South,
  West,
}

// Ancak, isterseniz enum değerlerini manuel olarak atayabilirsiniz.
enum StatusCodes {
  OK = 200,
  BadRequest = 400,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
}

// Enum'ları kullanmak için, enum adını ve ardından nokta operatörünü
const startingDirection = CompassDirection.East;
const currentStatus = StatusCodes.OK;

// Enum değerlerine erişmenin başka bir yolu da köşeli parantez notasyonudur.
const okNumber = StatusCodes.OK;
const okNumberIndex = StatusCodes["OK"];
const stringBadRequest = StatusCodes[400];

// Ayrıca, enum değerlerini string olarak da atayabilirsiniz.
enum GamePadInput {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// const moveUp = GamePadInput.Up;
const enum MouseAction {
  MouseDown,
  MouseUpOutside,
  MouseUpInside,
}

// MouseAction enum'ını kullanan bir fonksiyon tanımlayın.
const handleMouseAction = (action: MouseAction) => {
  switch (action) {
    case MouseAction.MouseDown:
      console.log("Mouse Down");
      break;
  }
};
