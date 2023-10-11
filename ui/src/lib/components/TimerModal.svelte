<script>
  import { Button, Icon, Modal, ModalBody, ModalFooter, Tooltip } from "yesvelte";

  let showCenter = false;
</script>

<Button color="primary" on:click={() => (showCenter = true)} class="!rounded-full md:!w-14 md:!h-14">
  <Icon name="clock-hour-4" />
</Button>
<Tooltip text="Start Timer" />
<Modal title="Set Timer" placement="center" bind:show={showCenter}>
  <ModalBody>This modal is placed in the center of the screen.</ModalBody>
  <ModalFooter>
    <Button color="green" on:click={() => (showCenter = false)}>Start</Button>
    <Button color="red" on:click={() => (showCenter = false)}>Cancel</Button>
  </ModalFooter>
</Modal>
