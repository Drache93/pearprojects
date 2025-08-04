export function Counter(props: { count: number }) {
  return (
    <div>
      <h2>Count: {props.count}</h2>
      <button hx-put="/count" hx-swap="outerHTML" hx-target="closest div">
        Click me
      </button>
    </div>
  );
}
