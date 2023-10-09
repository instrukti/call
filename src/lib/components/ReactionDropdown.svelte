<script>
  import { Button, Icon, Popover, PopoverBody } from "yesvelte";
</script>

<Button color="warning" class="!rounded-full md:!w-14 md:!h-14">
  <Icon name="mood-smile" />
</Button>
<Popover trigger="hover" placement="top">
  <PopoverBody>
    <div class="flex flex-col space-y-4">
      <Button size="lg" class="text-4xl xl:text-5xl">😂</Button>
      <Button size="lg" class="text-4xl xl:text-5xl">🧡</Button>
      <Button size="lg" class="text-4xl xl:text-5xl">🎉</Button>
      <Button size="lg" class="text-4xl xl:text-5xl">👏</Button>
    </div>
  </PopoverBody>
</Popover>
