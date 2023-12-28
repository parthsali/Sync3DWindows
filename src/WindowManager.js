class WindowManager {
    #storageKey = "windows";
    #windows;
    #count;
    #id;
    #winData;
    #winShapeChangeCallback;
    #winChangeCallback;

    constructor() {
        try {
            const that = this;

            addEventListener("storage", (event) => {
                if (event.key === that.#storageKey) {
                    let newWindows = JSON.parse(event.newValue);
                    let winChange = that.isWIndowChange(that.#windows, newWindows);

                    that.#windows = newWindows;

                    if (winChange) {
                        if (that.#winChangeCallback) that.#winChangeCallback();
                    }
                }
            });

            window.addEventListener('beforeunload', function (e) {
                let index = that.getWindowIndexFromId(that.#id);
                that.#windows.splice(index, 1);
                that.updateWindowsLocalStorage();
            });

        } catch (error) {
            console.error("Error in constructor:", error);
        }
    }


    getWindows() {
        return this.#windows;
    }

    getThisWindowData() {
        return this.#winData;
    }

    getThisWindowID() {
        return this.#id;
    }

    getWinShape() {
        let shape = { x: window.screenLeft, y: window.screenTop, w: window.innerWidth, h: window.innerHeight };
        return shape;
    }

    getWindowIndexFromId(id) {
        return this.#windows.findIndex(win => win.id === id);
    }


    setWinShapeChangeCallback(callback) {
        this.#winShapeChangeCallback = callback;
    }

    setWinChangeCallback(callback) {
        this.#winChangeCallback = callback;
    }

    isWIndowChange(pWins, nWins) {
        if (pWins.length !== nWins.length) {
            return true;
        }

        return pWins.every((win, i) => win.id !== nWins[i].id);
    }





    init(metaData) {
        this.#windows = JSON.parse(localStorage.getItem("windows")) || [];
        this.#count = localStorage.getItem("count") || 0;
        this.#count++;

        this.#id = this.#count;
        let shape = this.getWinShape();
        this.#winData = { id: this.#id, shape: shape, metaData: metaData };
        this.#windows.push(this.#winData);

        localStorage.setItem("count", this.#count);
        this.updateWindowsLocalStorage();
    }


    updateWindowsLocalStorage() {
        try {
            localStorage.setItem(this.#storageKey, JSON.stringify(this.#windows));
        } catch (error) {
            console.error("Error updating windows in local storage:", error);
        }
    }


    update() {
        try {
            let winShape = this.getWinShape();

            if (
                winShape.x !== this.#winData.shape.x ||
                winShape.y !== this.#winData.shape.y ||
                winShape.w !== this.#winData.shape.w ||
                winShape.h !== this.#winData.shape.h
            ) {
                this.#winData.shape = winShape;

                let index = this.getWindowIndexFromId(this.#id);
                this.#windows[index].shape = winShape;

                if (this.#winShapeChangeCallback) this.#winShapeChangeCallback();
                this.updateWindowsLocalStorage();
            }
        } catch (error) {
            console.error("Error in update method:", error);
        }
    }


}

export default WindowManager;