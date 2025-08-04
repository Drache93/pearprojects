import { Counter } from "./components/Counter";

export function App(props: { name: string; count: number }) {
  return (
    <>
      <div id="hello">
        <h1>Hello {props.name}!</h1>
        <Counter count={props.count} />
      </div>
    </>
  );
}
