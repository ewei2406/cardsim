export type Result<K, V> =
	| {
			variant: "ok";
			value: K;
	  }
	| {
			variant: "error";
			error: V;
	  };