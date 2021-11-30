class PropertyStorage {
  constructor() {
    this.propertyExternalId = '{{ propertyExternalId }}';
  }

  // LS wrapper methods
  getKey = key => `${this.propertyExternalId}.${key}`;

  setToStorage = (key, value) =>
    localStorage.setItem(this.getKey(key), value);

  getFromStorage = key =>
    localStorage.getItem(this.getKey(key));

  removeFromStorage = key =>
    localStorage.removeItem(this.getKey(key));
}

const storage = new PropertyStorage();
export default storage;
