import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";

test("按钮点击", () => {
  const onClick = jest.fn(); // 测试函数
  // render 用来渲染元素
  const { getByLabelText } = render(
    <button aria-label="Button" onClick={onClick} />
  );
  // getByLabelText 可以通过aria-label的值来获取元素
  const btn = getByLabelText("Button");
  fireEvent.click(btn); // 模拟点击事件
  expect(onClick).toBeCalled(); // 期望被调用
  expect(onClick).toBeCalledTimes(1); // 期望被调用一次
});

test("输入框输入,校验值", () => {
  const onChange = jest.fn();
  const { getByTestId } = render(
    <input data-testid="input" onChange={onChange} />
  );
  // 通过data-testid的方式来获取元素
  const input = getByTestId("input");
  // 模拟change事件，第二个参数模拟event的值
  fireEvent.change(input, { target: { value: "test" } });
  expect(onChange).toBeCalled();
  expect(input).toHaveValue("test");
});

test("测试元素是否disabled，是否包含某一类名", () => {
  const { getByText } = render(
    <button disabled className="button-disabled">
      this is a button
    </button>
  );
  // getByText从text来获取元素
  const btn = getByText("this is a button");
  expect(btn).toBeDisabled();
  expect(btn).toHaveClass("button-disabled");
});

test("测试props改变对元素是否生效", () => {
  const Demo = ({ loading }) => (
    <button aria-label="Button">{loading ? "loading" : "button"}</button>
  );
  const { getByLabelText, rerender } = render(<Demo />);
  const btn = getByLabelText("Button");
  expect(btn).toHaveTextContent("button");
  // 通过rerender来模拟props对改变
  rerender(<Demo loading />);
  expect(btn).toHaveTextContent("loading");
});

test("测试子元素是否包含某一类名", () => {
  const Demo = ({ loading }) => (
    <button aria-label="Button">
      <span className={loading ? "loading" : "button"}>button</span>
    </button>
  );
  const { baseElement } = render(<Demo loading />);
  const ele = baseElement.getElementsByClassName("loading");
  expect(ele.length).toBe(1);
});

test("测试异步事件", async () => {
  const Demo = ({ onClick }) => {
    const asyncClick = async () => {
      await Promise.resolve();
      onClick("click");
    };
    return <button onClick={asyncClick}>button</button>;
  };
  const fn = jest.fn();
  const { getByText } = render(<Demo onClick={fn} />);
  const btn = getByText("button");
  fireEvent.click(btn);
  await waitFor(() => expect(fn).toBeCalledWith("click"));
});

test("测试定时器", () => {
  jest.useFakeTimers(); // 使用fakeTimer
  const Demo = ({ onClick }) => {
    const waitClick = () => {
      setTimeout(() => {
        onClick();
      }, 10000);
    };
    return <button onClick={waitClick}>button</button>;
  };
  const fn = jest.fn();
  const { getByText } = render(<Demo onClick={fn} />);
  const btn = getByText("button");
  fireEvent.click(btn);
  jest.runAllTimers(); // 执行所有timer
  expect(fn).toBeCalled();
  jest.useRealTimers(); // 使用realTimer
});

test("snapshot 测试", () => {
  const Demo = () => (
    <form>
      <input name="test" type="text" />
      <button type="submit">submit</button>
    </form>
  );
  const { asFragment } = render(<Demo />);
  expect(asFragment()).toMatchSnapshot();
});

test("Hooks 测试", () => {
  const useCounter = () => {
    const [count, setCount] = React.useState(0);
    const increment = React.useCallback(() => setCount((x) => x + 1), []);
    return { count, increment };
  };
  const { result } = renderHook(() => useCounter());
  // result.current 包含hooks的返回值
  expect(result.current.count).toBe(0);
  // result.current.increment()的调用需要放在waitFor里
  waitFor(() => result.current.increment());
  expect(result.current.count).toBe(1);
});

test("异步 Hooks 测试", async () => {
  const useCounter = () => {
    const [count, setCount] = React.useState(0);
    const incrementAsync = React.useCallback(
      () => setTimeout(() => setCount((x) => x + 1), 100),
      []
    );
    return { count, incrementAsync };
  };

  const { result, waitForNextUpdate } = renderHook(() => useCounter());
  result.current.incrementAsync();
  // waitForNextUpdate等待下一次更新，默认会等待1000毫秒
  await waitForNextUpdate();
  expect(result.current.count).toBe(1);
});
