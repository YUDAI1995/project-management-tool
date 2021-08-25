// Valldation
export interface Validatable {
  value: string | number;
  required?: boolean;
  //required: boolean | undefined; //undefinedとしても基本的には同じ : 任意のプロパティとすることができる

  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
}

export function validate(validatableInput: Validatable) {
  let isValid = true;

  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    //console.log(validatableInput.value + ': 未入力の項目があります');
  }

  if (
    validatableInput.minLength != null && // null はnull とundefinedを含む 0はチェックの対象になる
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length >= validatableInput.minLength;
    //isValid ? console.log(validatableInput.value + ': 文字が短すぎます') : false
  }

  if (
    validatableInput.maxLength &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid &&
      validatableInput.value.trim().length <= validatableInput.maxLength;
    //isValid ? console.log((validatableInput.value + ':文字数が長すぎます')) : false
  }

  if (validatableInput.min && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }

  if (validatableInput.max && typeof validatableInput.value === "number") {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
}