<script setup>
import { computed } from "vue";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const props = defineProps({
  class: {
    type: String,
    default: "",
  },
  asChild: {
    type: Boolean,
    default: false,
  },
});

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);
</script>

<template>
  <label
    :class="cn(labelVariants(), props.class)"
  >
    <slot />
  </label>
</template>
