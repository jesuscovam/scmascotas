<script lang="ts">
	import { Progress as ProgressPrimitive } from "bits-ui";
	import { cn, type WithoutChildrenOrChild } from "../../../utils.js";

	let {
		ref = $bindable(null),
		class: className,
		indicatorClass,
		max = 100,
		value,
		...restProps
	}: WithoutChildrenOrChild<ProgressPrimitive.RootProps> & { indicatorClass?: string } = $props();
</script>

<ProgressPrimitive.Root
	bind:ref
	data-slot="progress"
	class={cn("h-2 rounded-full w-full", className)}
	{value}
	{max}
	{...restProps}
>
	<div
		data-slot="progress-indicator"
		class={cn("h-full rounded-full transition-all duration-500", indicatorClass)}
		style="width: {(100 * (value ?? 0)) / (max ?? 1)}%"
	></div>
</ProgressPrimitive.Root>
