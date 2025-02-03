export type Option<K> =
	| {
			variant: "some";
			value: K;
	  }
	| {
			variant: "none";
	  };
