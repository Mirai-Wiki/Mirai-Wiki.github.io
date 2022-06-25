class EventEmitter {
    constructor()
    {
        console.log("constructor");
        this._events = {};
    }

    on(name, listener)
    {
        if (!this._events[name])
        {
            this._events[name] = [];
        }

        this._events[name].push(listener);
    }

    emit(name, data)
    {
        if (!this._events[name])
        {
            throw new Error(`Error EventEmitter: ${name} event does not exist!`);
        }

        const fireCallback = (callback) => {
            callback(data);
        };

        this._events[name].forEach(fireCallback);
    }
}
