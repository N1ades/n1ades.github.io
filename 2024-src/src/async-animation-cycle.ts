export const requestAnimationFrames = () => {
    const defaultCancel = () => {
      res.canceled = true;
      // console.warn('no frames were canceled');
    };
  
    const asyncIterable = {
      [Symbol.asyncIterator]: () => {
        return {
          next: () => {
            return new Promise<any>((resolve, reject) => {
              if (res.canceled) {
                resolve({ done: true });
              }
  
              const frameId = requestAnimationFrame((time) => {
                res.lastTime = time;
                res.cancel = defaultCancel;
                resolve({ value: time });
              });
  
              res.cancel = () => {
                res.canceled = true;
                res.cancel = defaultCancel;
                cancelAnimationFrame(frameId);
                resolve({ done: true });
              };
            });
          },
          return: async () => {
            return Promise.resolve({ done: true } as any);
          },
        };
      },
    };
  
    const res = {
      canceled: false,
      cursor: asyncIterable,
      cancel: defaultCancel,
      lastTime: undefined as undefined | number,
    };
  
    return res;
  };