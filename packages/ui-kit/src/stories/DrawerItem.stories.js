/**
 * DrawerItem story (for demo).
 * @author Yuri A Taranov <me@flanker72.ru>
 */
import VcDrawerItem from "../components/vc-drawer-item";

export default {
  title: "Drawer Item",
  component: VcDrawerItem,
  argTypes: {
    click: { action: "click", name: "click" }
  }
};

const Template = (args, { argTypes }) => ({
  components: { VcDrawerItem },
  props: Object.keys(argTypes),
  template: '<vc-drawer-item v-bind="$props"></vc-drawer-item>'
});

export const DrawerItem = Template.bind({});
DrawerItem.args = {
  icon: "folder",
  sticky: false,
  title: "Drawer Item"
};
