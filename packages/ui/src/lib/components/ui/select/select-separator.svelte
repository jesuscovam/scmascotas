<script lang="ts">
	import { cn } from "../../../utils.js";

	let { class: className, ...restProps } = $props();
</script>

<hr
	data-slot="select-separator"
	class={cn("-mx-1 my-1 h-px border-none bg-warm-200 pointer-events-none", className)}
	{...restProps}
/>
